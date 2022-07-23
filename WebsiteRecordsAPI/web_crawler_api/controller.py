import datetime
from flask import request
from flask import abort, jsonify
from sqlalchemy import insert
from sqlalchemy.exc import IntegrityError

from web_crawler_api import app, engine
from web_crawler_api.model import db, Execution, CrawledDataLink, CrawledData, Website, WebsiteTag
import json
from datetime import datetime, time


# TODO change from url to id website params
# TODO send executions sorted descending by end time or send latest
def defaultconverter(o):
    if isinstance(o, time):
        return o.__str__()


class Controller:
    @staticmethod
    @app.route('/website_records/crawled', methods=['POST'])
    def read_all_website_records_crawled_link():
        req = request.json
        try:
            link = req['link']
            joint = CrawledDataLink.query.filter(CrawledDataLink.link == link).all()
            website_records = []
            for elem in joint:
                website_record = {}
                website_url = elem.crawled_data_url
                website = Website.query.filter(Website.url == website_url).one_or_none()
                website_record['url'] = website_url
                website_record['periodicity']=website.periodicity
                website_record['label'] =website.label
                crawled_data = CrawledData.query.filter(CrawledData.url == website_url).one_or_none()
                website_record['crawl_time'] = crawled_data.crawl_time
                executions = Execution.query.filter(Execution.website_url == website_url).all()
                executions.sort(key=lambda x: x.start_time, reverse=True)
                execution = executions[0]
                website_record['end_time'] = execution.end_time
                website_record['status'] = execution.status
                website_records.append(website_record)
            website = Website.query.filter(Website.url==link).one_or_none()
            if website:
                website_record = {}
                website_record['url'] = website.url
                website_record['periodicity'] = website.periodicity
                website_record['label'] = website.label
                crawled_data = CrawledData.query.filter(CrawledData.url == website_url).one_or_none()
                website_record['crawl_time'] = crawled_data.crawl_time
                executions = Execution.query.filter(Execution.website_url == website_url).all()
                executions.sort(key=lambda x: x.start_time, reverse=True)
                execution = executions[0]
                website_record['end_time'] = execution.end_time
                website_record['status'] = execution.status
                website_records.append(website_record)
            data = json.dumps(website_records,default=defaultconverter)
            return data
        except Exception as e:
            abort(
                400,
                "Encountered error: {error}".format(error = e),
            )





    @staticmethod
    @app.route('/website_records', methods=['GET'])
    def read_all_website_records():
        websites = Website.query.order_by(Website.url).all()
        joint = db.session.query(Website, WebsiteTag).join(WebsiteTag).all()

        website_tags = {}
        for join_item in joint:
            if join_item[0].url not in website_tags.keys():
                website_tags[join_item[0].url] = [join_item[1].tag]
            else:
                if join_item[1].tag not in website_tags[join_item[0].url]:
                    website_tags[join_item[0].url].append(join_item[1].tag)
        encoded = []
        for website in websites:
            website = website.toJSON()
            website['tags'] = ''
            for tag in website_tags[website['url']]:
                website['tags'] += tag
                website['tags'] += ','
            website_url = website['url']
            links = db.session.query(CrawledDataLink).filter(CrawledDataLink.crawled_data_url == website_url).all()
            crawled = db.session.query(CrawledData).filter(CrawledData.url == website_url).all()
            if crawled:
                crawl_time = crawled[0].crawl_time
                title = crawled[0].title
            else:
                crawl_time = 'N/A'
                title = 'N/A'
            website_links = []
            for link in links:
                website_links.append(link.link)
            website['links'] = website_links
            website['title'] = title
            website['crawl_time'] = crawl_time
            executions = Execution.query.filter(Execution.website_url == website_url).all()
            executions.sort(key=lambda x: x.start_time, reverse=True)
            if executions:
                flag = False
                for execution in executions:
                    if execution.status == 'success':
                        website["time"] = str(execution.start_time)
                        website["status"] = execution.status
                        flag = True
                        break
                if not flag:
                    website["time"] = "N/A"
                    website["status"] = "N/A"
                encoded.append(website)
            else:
                website["time"] = "N/A"
                website["status"] = "N/A"
                encoded.append(website)

        encoded.sort(key=lambda x: x['url'])

        data = json.dumps(encoded, default=defaultconverter)

        return data

    @staticmethod
    @app.route('/executions', methods=['GET'])
    def read_all_executions():
        executions = Execution.query.all()
        encoded = []
        for execution in executions:
            execution = execution.toJSON()
            website = Website.query.filter(Website.url == execution['website_url']).one_or_none()
            execution['label'] = website.label
            encoded.append(execution)
        data = json.dumps(encoded, default=defaultconverter)
        return data

    @staticmethod
    @app.route('/executions/loading', methods=['GET'])
    def read_all_loading_executions():
        executions = Execution.query.filter(Execution.status == 'loading').all()
        encoded = []
        for execution in executions:
            execution = execution.toJSON()
            website = Website.query.filter(Website.url == execution['website_url']).one_or_none()
            execution['label'] = website.label
            execution['identifier'] = website.id
            execution['regex'] = website.regex
            execution['periodicity'] = website.periodicity
            execution['url'] = website.url
            encoded.append(execution)

        data = json.dumps(encoded, default=defaultconverter)

        return data

    @staticmethod
    @app.route('/executions/<website_id>', methods=['GET'])
    def read_execution(website_id):

        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is not None:
            executions = Execution.query.filter(Execution.website_url == website.url).all()
            encoded = []
            for execution in executions:
                execution = execution.toJSON()
                encoded.append(execution)

            data = json.dumps(encoded, default=defaultconverter)

            return data

        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/executions/<website_id>/latest', methods=['GET'])
    def read_latest_execution(website_id):

        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is not None:
            executions = Execution.query.filter(Execution.website_url == website.url).all()
            executions.sort(key=lambda x: x.end_time, reverse=True)
            encoded = {}
            flag = False
            for execution in executions:
                if execution.status == 'success':
                    execution = execution.toJSON()
                    encoded = execution
                    flag = True
                    break
            if not flag:
                abort(
                    404,
                    "No previous executions for website id: {website_id}".format(website_id=website_id),
                )
            data = json.dumps(encoded, default=defaultconverter)

            return data

        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/execution/empty', methods=['POST'])
    def create_loading_execution():
        try:
            req = request.data
            req = json.loads(req)
            print("Post : " + str(req))
            website_url = req['url']
            start = datetime.now()
            end = start
            status = 'loading'
            nrSites = 0
        except KeyError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except ValueError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        try:
            execution = Execution(website_url=website_url, status=status, start=start, end=end, nrSites=nrSites)
            db.session.add(execution)
            db.session.commit()
        except ValueError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except IntegrityError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        return jsonify(message='Successfully added execution'), 201

    @staticmethod
    @app.route('/execution', methods=['PUT'])
    def update_execution():
        try:
            req = request.data
            req = json.loads(req)

            print("Put : " + str(req))
            id = req['id']
            website_url = req['url']
            start = req['start_time']
            end = req['end_time']
            status = req['status']
            nrSites = req['nr_of_sites_crawled']
        except KeyError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except ValueError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        try:
            execution = Execution.query.filter(Execution.id==id).first()
            execution.status = status
            execution.nr_of_sites_crawled = nrSites
            execution.start_time = start
            execution.end_time = end
            db.session.commit()
        except ValueError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except IntegrityError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        return jsonify(message='Successfully added execution'), 200

    @staticmethod
    @app.route('/execution', methods=['POST'])
    def create_execution():
        try:
            req = request.data
            req = json.loads(req)
            print("Post : " + str(req))
            website_url = req['url']
            start = req['start_time']
            end = req['end_time']
            status = req['status']
            nrSites = req['nr_of_sites_crawled']
        except KeyError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except ValueError as error:
            abort(
                400,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        try:
            execution = Execution(website_url=website_url, status=status, start=start, end=end, nrSites=nrSites)
            db.session.add(execution)
            db.session.commit()
        except ValueError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )
        except IntegrityError as error:
            abort(
                409,
                "Error adding execution : {error}".format(
                    error=error
                ),
            )

        return jsonify(message='Successfully added execution'), 200

    @staticmethod
    @app.route('/execution/<execution_id>', methods=['DELETE'])
    def delete_execution(execution_id):
        execution_rec = Execution.query.filter(Execution.id == execution_id).one_or_none()
        if execution_rec is not None:
            execution = Execution()
            execution.copy(execution_rec)
            Execution.query.filter_by(id=execution_id).delete()
            db.session.commit()
            return json.dumps(execution.toJSON(), default=defaultconverter), 200
        else:
            abort(
                404,
                "Execution not found for id : {execution_id}".format(execution_id=execution_id),
            )

    @staticmethod
    @app.route('/websites', methods=['GET'])
    def read_all_websites():
        websites = Website.query.order_by(Website.url).all()
        joint = db.session.query(Website, WebsiteTag).join(WebsiteTag).all()
        website_tags = {}
        for join_item in joint:
            if join_item[0].url not in website_tags.keys():
                website_tags[join_item[0].url] = [join_item[1].tag]
            else:
                if join_item[1].tag not in website_tags[join_item[0].url]:
                    website_tags[join_item[0].url].append(join_item[1].tag)
        encoded = []
        for website in websites:
            website = website.toJSON()
            website['tags'] = website_tags[website['url']]
            encoded.append(website)
        data = json.dumps(encoded, default=defaultconverter)
        return data

    @staticmethod
    @app.route('/website/<website_id>', methods=['GET'])
    def read_website(website_id):
        print(website_id)
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is not None:
            joint = db.session.query(Website, WebsiteTag).join(WebsiteTag).filter(
                Website.url == website_id).all()
            tags = []
            for join_item in joint:
                tags.append(join_item[1].tag)
            data = website.toJSON()
            data['tags'] = tags

            return jsonify(data), 200

        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/website', methods=['POST'])
    def create_website():
        if not request.json or not 'url' in request.json:
            abort(400)

        try:
            req = request.json
            url = req['url']
            regex = req['regex']
            active = req['active']
            periodicity = req['periodicity']
            format = '%H:%M:%S'
            res = True
            try:
                res = bool(datetime.strptime(periodicity, format))
            except ValueError:
                res = False
            if not res:
                abort(
                    400,
                    "Please input valid periodicity: %H:%M:%S"
                )
            label = req['label']
            tags = req['tags']
        except KeyError as error:
            abort(
                400,
                "Error adding website : {error}".format(
                    error=error
                ),
            )

        existing_website = (
            Website.query.filter(Website.url == url)
            .one_or_none()
        )

        if existing_website is None:
            website = Website(url=url, regex=regex, active=active, periodicity=periodicity, label=label)
            try:
                db.session.add(website)
                db.session.commit()
                for tag in tags:
                    try:
                        stmt = insert(WebsiteTag).values(website_url=website.url, tag=tag)
                        with engine.connect() as conn:
                            conn.execute(stmt)
                        db.session.commit()
                    except ValueError:
                        pass
                    except KeyError:
                        pass
            except ValueError as error:
                abort(
                    409,
                    "Error adding website : {error}".format(
                        error=error
                    ),
                )

            return jsonify(message='Successfully added website'), 200
        else:
            abort(
                409,
                "Website {url} exists already".format(
                    url=url
                ),
            )

    @staticmethod
    @app.route('/website_record/<website_id>', methods=['PUT'])
    def update_allowed_website(website_id):
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is not None:
            website_url = website.url

            req = request.json

            try:
                regex = req['regex']
                active = req['active']
                periodicity = req['periodicity']

            except KeyError as error:
                abort(
                    400,
                    "Error adding website : {error} is missing".format(
                        error=error
                    ),
                )
            updates = {
                'regex': regex,
                'active': active,
                'periodicity': periodicity,
            }

            db.session.commit()

            try:
                Website.query.filter_by(url=website_url).update(updates)
            except ValueError as error:
                abort(
                    409,
                    "Error updating website : {error}".format(
                        error=error
                    ),
                )
            db.session.commit()

            return json.dumps(website, default=defaultconverter), 200
        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/website/<website_id>', methods=['PUT'])
    def update_website(website_id):
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is not None:
            website_url = website.url

            req = request.json

            try:
                regex = req['regex']
                active = req['active']
                periodicity = req['periodicity']
                label = req['label']
                tags = req['tags']
            except KeyError as error:
                abort(
                    400,
                    "Error adding website : {error} is missing".format(
                        error=error
                    ),
                )
            updates = {
                'regex': regex,
                'active': active,
                'periodicity': periodicity,
                'label': label
            }

            WebsiteTag.query.filter_by(website_url=website_url).delete()
            db.session.commit()

            for tag in tags:
                try:
                    stmt = insert(WebsiteTag).values(website_url=website.url, tag=tag)
                    with engine.connect() as conn:
                        conn.execute(stmt)
                    db.session.commit()
                except ValueError:
                    pass
                except KeyError:
                    pass

            try:
                Website.query.filter_by(url=website_url).update(updates)
            except ValueError as error:
                abort(
                    409,
                    "Error updating website : {error}".format(
                        error=error
                    ),
                )
            db.session.commit()

            return json.dumps(website, default=defaultconverter), 200
        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/website/<website_id>', methods=['DELETE'])
    def delete_website(website_id):
        website_rec = Website.query.filter(Website.id == website_id).one_or_none()
        if website_rec is not None:
            website_url = website_rec.url
            joint = db.session.query(Website, WebsiteTag).filter(Website.url == WebsiteTag.website_url).filter(
                Website.url == website_url).all()
            tags = []
            for join_item in joint:
                tags.append(join_item[1].tag)
            data = website_rec.toJSON()
            data['tags'] = tags
            Website.query.filter(Website.url == website_url).delete()
            WebsiteTag.query.filter(WebsiteTag.website_url == website_url).delete()
            Execution.query.filter(Execution.website_url == website_url).delete()
            CrawledDataLink.query.filter(CrawledDataLink.crawled_data_url == website_url).delete()
            CrawledData.query.filter(CrawledData.url == website_url).delete()
            db.session.commit()

            return json.dumps(data, default=defaultconverter)
        else:
            abort(
                404,
                "Website not found for id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/link', methods=['PUT'])
    def update_link():
        req = request.get_json(force=True)

        try:
            print(req)
            crawl_time = req['crawl_time']
            crawled_data_url = req['crawled_data_url']
            link = req['link']
            title = req['title']
            updates = {
                'link': link,
                'crawl_time': crawl_time,
                'crawled_data_url': crawled_data_url,
                'title': title
            }
        except KeyError as error:
            abort(
                400,
                "Error updating link : {error} is missing".format(
                    error=error
                ),
            )

        try:
            CrawledDataLink.query.filter(CrawledDataLink.crawled_data_url==crawled_data_url, CrawledDataLink.link == link).update(updates)
        except ValueError as error:
            abort(
                404,
                "Error updating website : {error}".format(
                    error=error
                ),
            )
        db.session.commit()
        data = updates
        data = json.dumps(data)
        return data

    @staticmethod
    @app.route('/links', methods=['GET'])
    def read_all_links():
        crawled_data_links = CrawledDataLink.query.all()

        data = []
        for link in crawled_data_links:
            data.append(
                {'crawled_data_url': link.crawled_data_url, 'link': link.link, 'crawl_time': link.crawl_time,
                 "title": link.title})
        data = json.dumps(data,default=defaultconverter)

        return data

    @staticmethod
    @app.route('/crawled_data', methods=['GET'])
    def read_all_crawled_data():
        crawled_datas = CrawledData.query.order_by(CrawledData.url).all()
        joint = db.session.query(CrawledData, CrawledDataLink, Website, WebsiteTag).join(
            CrawledDataLink, isouter=True).join(Website).join(WebsiteTag).all()
        crawled_data_links = {}
        tags = {}
        for join_item in joint:
            if join_item[0].url not in crawled_data_links.keys():
                crawled_data_links[join_item[0].url] = {
                    'regex': join_item[2].regex,
                    'active': join_item[2].active,
                    'label': join_item[2].label,
                    'periodicity': join_item[2].periodicity,
                    'id': join_item[2].id
                }
                if join_item[1] is not None:
                    crawled_data_links[join_item[0].url]['links'] = [join_item[1].link]
            else:
                if join_item[1] is not None:
                    if join_item[1].link not in crawled_data_links[join_item[0].url]['links']:
                        crawled_data_links[join_item[0].url]['links'].append(join_item[1].link)
            if join_item[0].url not in tags.keys():
                tags[join_item[0].url] = [join_item[3].tag]
            else:
                if join_item[3].tag not in tags[join_item[0].url]:
                    tags[join_item[0].url].append(join_item[3].tag)

        encoded = []
        for crawled_data in crawled_datas:
            crawled_data = crawled_data.toJSON()
            crawled_data['id'] = crawled_data_links[crawled_data['url']]['id']
            if 'links' in crawled_data_links[crawled_data['url']].keys():
                crawled_data['links'] = crawled_data_links[crawled_data['url']]['links']
            else:
                crawled_data['links'] = []
            crawled_data['regex'] = crawled_data_links[crawled_data['url']]['regex']
            crawled_data['active'] = crawled_data_links[crawled_data['url']]['active']
            crawled_data['label'] = crawled_data_links[crawled_data['url']]['label']
            crawled_data['periodicity'] = crawled_data_links[crawled_data['url']]['periodicity']
            crawled_data['tags'] = tags[crawled_data['url']]
            encoded.append(crawled_data)
        data = json.dumps(encoded, default=defaultconverter)
        return data

    @staticmethod
    @app.route('/crawled_data/<website_id>', methods=['GET'])
    def read_crawled_data(website_id):
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is None:
            abort(
                404,
                "CrawledData not found for id: {website_id}".format(website_id=website_id),
            )
        crawled_data_url = website.url
        crawled_data = CrawledData.query.filter(CrawledData.url == crawled_data_url).one_or_none()

        link_records = CrawledDataLink.query.filter(CrawledDataLink.crawled_data_url == crawled_data_url).all()
        tag_records = WebsiteTag.query.filter(WebsiteTag.website_url == crawled_data_url).all()
        links = []
        tags = []

        for link_rec in link_records:
            link = link_rec.link
            links.append(link)
        for tag_rec in tags:
            tag = tag_rec.tag
            tags.append(tag)

        # for join_item in joint:
        #     print(str(join_item[0]) + " " + str(join_item[3]))
        #     if not crawled_data_links.keys():
        #         crawled_data_links = {
        #             'regex': join_item[2].regex,
        #             'active': join_item[2].active,
        #             'label': join_item[2].label,
        #             'periodicity': join_item[2].periodicity
        #         }
        #     if join_item[1] is not None:
        #         if join_item[1].link not in links:
        #             links.append(join_item[1].link)
        #     if join_item[3].tag not in tags:
        #         tags.append(join_item[3].tag)
        if crawled_data:
            data = crawled_data.toJSON()
            data['id'] = website_id
            data['links'] = links
            data['regex'] = website.regex
            data['active'] = website.active
            data['label'] = website.label
            data['periodicity'] = website.periodicity
            data['tags'] = tags
            executions = Execution.query.filter(Execution.website_url == website.url).all()
            executions.sort(key=lambda x: x.start_time, reverse=True)
            if executions:
                flag = False
                for execution in executions:
                    if execution.status == 'success':
                        data["time"] = str(execution.start_time)
                        data["status"] = execution.status
                        flag = True
                        break
                if not flag:
                    data["time"] = "N/A"
                    data["status"] = "N/A"
            else:
                data["time"] = "N/A"
                data["status"] = "N/A"
        else:
            data = {}
            data['url'] = website.url

        return json.dumps(data, default=defaultconverter)

    @staticmethod
    @app.route('/crawled_data', methods=['POST'])
    def create_crawled_data():
        print('POST')
        req = request.data
        print(req)
        try:
            req = json.loads(req)
            if not 'url' in req:
                print('Not ok')
                print(request.data)
                abort(400)
            url = req['url']
            crawled_data_url = url
            crawlTime = req['crawl_time']
            title = req['title']
            links = req['links']
        except KeyError as error:
            abort(
                400,
                "Error adding crawled data : {error} is missing".format(
                    error=error
                ),
            )
        except ValueError as error:
            abort(
                400,
                "Error adding crawled data : {error} is missing".format(
                    error=error
                ),
            )

        existing_crawled_data = (
            CrawledData.query.filter(CrawledData.url == url)
            .one_or_none()
        )

        # todo UPDATE
        if existing_crawled_data is None:
            print("NEW POST")
            crawled_data = CrawledData(url, crawlTime, title)
            try:
                db.session.add(crawled_data)
                db.session.commit()
                for link in links:
                    try:
                        actual_link = link["link"]
                        link_crawl_time = link["crawl_time"]
                        if link_crawl_time=='':
                            link_crawl_time=None
                        link_title = link["title"]
                        stmt = insert(CrawledDataLink).values(crawled_data_url=url, link=actual_link,crawl_time=link_crawl_time,title=link_title)
                        with engine.connect() as conn:
                            conn.execute(stmt)
                        db.session.commit()
                    except ValueError:
                        pass
                    except KeyError:
                        pass
            except ValueError as error:
                print(error)
                abort(
                    409,
                    "Error adding crawled_data : {error}".format(
                        error=error
                    ),
                )
            except IntegrityError as error:
                print(error)
                abort(
                    409,
                    "Error adding crawled_data : {error}".format(
                        error=error
                    ),
                )

            data = json.dumps(crawled_data.toJSON(), default=defaultconverter)
            return data, 200
        else:
            print("OLD POST")
            crawled_data = CrawledData.query.filter(CrawledData.url == crawled_data_url).one_or_none()
            updates = {
                'crawl_time': crawlTime,
                'title': title,
            }
            CrawledDataLink.query.filter_by(crawled_data_url=crawled_data_url).delete()
            db.session.commit()

            for link in links:
                try:
                    actual_link = link['link']
                    link_crawl_time = link['crawl_time']
                    if link_crawl_time=='':
                        link_crawl_time=None
                    link_title = link['title']
                    stmt = insert(CrawledDataLink).values(crawled_data_url=crawled_data_url, link=actual_link, crawl_time = link_crawl_time, title = link_title)
                    with engine.connect() as conn:
                        conn.execute(stmt)
                    db.session.commit()
                except ValueError:
                    pass
                except KeyError:
                    pass

            CrawledData.query.filter_by(url=crawled_data_url).update(updates)
            db.session.commit()

            return json.dumps(crawled_data.toJSON(), default=defaultconverter), 200

    @staticmethod
    @app.route('/crawled_data/<website_id>', methods=['PUT'])
    def update_crawled_data(website_id):
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is None:
            abort(
                404,
                "CrawledData not found for id: {website_id}".format(website_id=website_id),
            )
        crawled_data_url = website.url
        crawled_data = CrawledData.query.filter(CrawledData.url == crawled_data_url).one_or_none()
        if crawled_data is not None:

            req = request.json
            try:
                crawlTime = req['crawlTime']
                title = req['title']
                links = req['links']
            except KeyError as error:
                abort(
                    400,
                    "Error updating crawled data : {error} is missing".format(
                        error=error
                    ),
                )
            updates = {
                'crawl_time': crawlTime,
                'title': title,
            }

            CrawledDataLink.query.filter_by(crawled_data_url=crawled_data_url).delete()
            db.session.commit()

            for link in links:
                try:
                    actual_link = link["link"]
                    link_crawl_time = link["crawl_time"]
                    if link_crawl_time == '':
                        link_crawl_time=None
                    link_title = link["title"]
                    stmt = insert(CrawledDataLink).values(crawled_data_url=crawled_data.url, link=actual_link,crawl_time = link_crawl_time,title=link_title)
                    with engine.connect() as conn:
                        conn.execute(stmt)
                    db.session.commit()
                except ValueError:
                    pass
                except KeyError:
                    pass

            CrawledData.query.filter_by(url=crawled_data_url).update(updates)
            db.session.commit()

            return json.dumps(crawled_data.toJSON(), default=defaultconverter), 200
        else:
            abort(
                404,
                "CrawledData not found for Id: {website_id}".format(website_id=website_id),
            )

    @staticmethod
    @app.route('/crawled_data/<website_id>', methods=['DELETE'])
    def delete_crawled_data(website_id):
        website = Website.query.filter(Website.id == website_id).one_or_none()

        if website is None:
            abort(
                404,
                "CrawledData not found for id: {website_id}".format(website_id=website_id),
            )
        crawled_data_url = website.url
        crawled_data = CrawledData.query.filter(CrawledData.url == crawled_data_url).one_or_none()
        if crawled_data is not None:
            CrawledData.query.filter_by(url=crawled_data_url).delete()
            db.session.commit()

            data = json.dumps(crawled_data.toJSON(), default=defaultconverter)

            return data
        else:
            abort(
                404,
                "CrawledData not found for Url: {crawled_data_url}".format(crawled_data_url=crawled_data_url),
            )
