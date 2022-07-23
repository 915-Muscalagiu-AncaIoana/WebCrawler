import json
from datetime import datetime

from ariadne import convert_kwargs_to_snake_case, format_error

from . import db
from .model import Website, WebsiteTag, CrawledData, CrawledDataLink



def converter(o):
    if isinstance(o, datetime.time):
        return o.__str__()

def resolve_websites(obj, info):
    try:
        websites = []
        for website in Website.query.all():
            url = website.url
            joint = db.session.query(Website, WebsiteTag).outerjoin(WebsiteTag).filter(
                Website.url == url).all()
            tags = []
            for join_item in joint:
                tags.append(join_item[1].tag)
            website = website.to_dict()
            website["tags"] = tags
            websites.append(website)
    except Exception as error:
        print(error)
        websites = []

    return websites

def resolve_nodes(obj, info, webPages):
    try:
        nodes = []
        for id in webPages:

            joint = db.session.query(CrawledData,  Website).outerjoin(
                Website).filter(
                Website.id == id).all()

            if joint:
                crawled_data = joint[0][0]
                website = joint[0][1]
                crawled_data = crawled_data.to_dict()

                url = crawled_data['url']
                joint = db.session.query(CrawledData, CrawledDataLink).join(CrawledDataLink).filter(
                    CrawledData.url == url).all()
                links = []
                for join_item in joint:
                    child_node = {}
                    child_node['url'] = join_item[1].link
                    child_node['crawl_time'] = join_item[1].crawl_time
                    child_node['owner' ] = website
                    child_node['links'] = None
                    child_node['title'] = join_item[1].title
                    links.append(child_node)
                crawled_data["links"] =links
            else:
                joint = db.session.query(Website).filter(Website.id == id).one_or_none()
                if joint:
                    url = joint.url
                else:
                    return format_error('')
            joint = db.session.query(Website, WebsiteTag).join(WebsiteTag).filter(
                Website.url == url).all()
            tags = []
            for join_item in joint:
                tags.append(join_item[1].tag)
            if isinstance(website,Website):
                website = website.to_dict()
            website["tags"] = tags

            crawled_data['owner'] = website

            print(crawled_data)
            nodes.append(crawled_data)
            print(joint)
    except Exception as error:
        print(error)
        nodes = []
    return nodes
