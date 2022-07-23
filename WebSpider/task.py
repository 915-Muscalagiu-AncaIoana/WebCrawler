import json
import multiprocessing
from time import sleep
import dateutil.parser
import traceback
from redis import Redis
from rq import Queue
import requests
from datetime import time, timedelta
from datetime import datetime
import urllib
import threading
from bs4 import BeautifulSoup
import csv
import re


def strfdelta(tdelta, fmt):
    d = {}
    d["hours"], rem = divmod(tdelta.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)
    return fmt.format(**d)


def crawl_site(website, depth, loaded, id_exec):
    if depth == 1:
        print('---------EXECUTION-----------')
        id = website['identifier']
    site = website['url']

    now = datetime.now()

    start_time = now
    nr_links = 0
    crawled_data = {}
    filtered_list = []
    try:
        response = requests.get(site)
        soup = BeautifulSoup(response.content, 'html5lib')
        title = soup.find('title')
        o = urllib.parse.urlsplit(site)
        links = []

        for link in soup.find_all('a', href=re.compile('^((https://)|(http://))')):
            if 'href' in link.attrs:
                if o.netloc in (link.attrs['href']):
                    continue
                else:
                    if link.attrs['href'] not in links:
                        links.append(link.attrs['href'])
        now = datetime.now()

        end_time = now
        crawl_time = end_time - start_time
        crawl_time = str(crawl_time)

        if depth == 2:
            if title:
                title = title.string
            else:
                title = ''
            linkk = {'crawled_data_url': website['parent'], 'link': website['url'], 'crawl_time': crawl_time,
                     'title': title}
            print("SENDING LINK")
            print(linkk)
            linkk = json.dumps(linkk)
            print(linkk)
            requests.put(url="http://api:5000/link", data=linkk)
            return

        regex = re.compile(website['regexp'])
        unfiltered_list = links
        filtered_list_before = list(filter(regex.match, links))
        filtered_list = []
        unfiltered = []
        for link in filtered_list_before:
            json_link = {}
            json_link["link"] = link
            json_link["crawl_time"] = ""
            json_link["title"] = ""
            filtered_list.append(json_link)
        for link in unfiltered_list:
            json_link = {}
            json_link["link"] = link
            json_link["crawl_time"] = ""
            json_link["title"] = ""
            unfiltered.append(json_link)

        crawled_data = {
            'url': site,
            'crawl_time': crawl_time,
            'links': unfiltered
        }

        if title:
            crawled_data['title'] = title.string
        else:
            crawled_data['title'] = ''
        crawled_data = json.dumps(crawled_data)

        nr_links = len(filtered_list)
        status = 'success'
    except Exception as error:
        now = datetime.now()
        end_time = now
        print('ERROR')
        traceback.print_exc()
        status = 'failure'

    execution = {
        'url': site,
        'start_time': str(start_time),
        'end_time': str(end_time),
        'status': status,
        'nr_of_sites_crawled': nr_links
    }

    execution['id'] = id_exec
    print(crawled_data)
    execution = json.dumps(execution)
    requests.post(url="http://api:5000/crawled_data", data=crawled_data)
    if not loaded:
        res = requests.post(url="http://api:5000/execution", data=execution)
    else:
        print('SEND PUT')
        requests.put(url="http://api:5000/execution", data=execution)
    print(execution)

    new_website = {}
    for link in filtered_list:
        new_website['url'] = link['link']
        new_website['regexp'] = website['regexp']
        new_website['parent'] = website['url']
        crawl_site(new_website, 2, loaded, id_exec)


class TaskManager:
    def __init__(self):
        self.queue = Queue(connection=Redis(host="redis"))
        self.queue.empty()
        self.url = "http://api:5000"

    def submit_task(self, website, loaded, id):
        print('Submitted')
        result = self.queue.enqueue(crawl_site, website, 1, loaded, id)
        return result

    def run(self):
        while True:
            # get websites

            executions = requests.get(url=self.url + "/executions/loading").text
            print('Loading')
            print(executions)
            executions = json.loads(executions)
            for execution in executions:
                website = {}
                website['identifier'] = execution['identifier']
                website['url'] = execution['url']
                website['regexp'] = execution['regex']
                website['periodicity'] = execution['periodicity']
                website['label'] = execution['label']
                self.submit_task(website, True, execution['id'])
            websites = requests.get(url=self.url + "/websites").text
            websites = json.loads(websites)

            for website in websites:
                # get latest execution
                if website['active']:
                    id = website['identifier']
                    url = website['url']
                    periodicity = website['periodicity']
                    execution = requests.get(url=self.url + "/executions/" + str(id) + "/latest")
                    if execution.status_code == 404:
                        self.submit_task(website, False, 0)
                    else:
                        execution = execution.text
                        try:
                            execution = json.loads(execution)
                        except Exception as e:
                            pass
                        print(execution)

                        time = execution['end_time']
                        time = dateutil.parser.isoparse(time)
                        hours, minutes, seconds = periodicity.split(':')
                        delta = timedelta(hours=int(hours), minutes=int(minutes), seconds=float(seconds))

                        req_time = time + delta
                        print(req_time)
                        print(datetime.now())
                        if req_time < datetime.now():
                            self.submit_task(website, False, 0)
            sleep(30)
