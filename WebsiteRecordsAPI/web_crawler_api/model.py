from web_crawler_api import db

#TODO add to XML
class Website(db.Model):
    __tablename__ = 'website'
    __table_args__ = {"schema": "my_schema"}
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    url = db.Column(db.String(200), unique=True)
    regex = db.Column(db.String(100), nullable=False)
    active = db.Column(db.Boolean, nullable=False)
    periodicity = db.Column(db.Time, nullable=False)
    label = db.Column(db.String(200), nullable=True)

    def __init__(self, url, regex, active, periodicity, label):
        self.url = url
        self.regex = regex
        self.active = active
        self.periodicity = periodicity
        self.label = label

    def __str__(self) -> str:
        return "(URL : {0}, Regex : {1}, Active : {2} )".format(self.url, self.regex,
                                                                self.active)

    def __repr__(self):
        return "(URL : {0}, Regex : {1}, Active : {2} )".format(self.url, self.regex, self.active)

    def toJSON(self):
        return {
            "identifier": self.id,
            "url": self.url,
            "regexp": self.regex,
            "active": self.active,
            "periodicity": str(self.periodicity),
            "label": self.label
        }

    def to_dict(self):
        return {
            "identifier": self.id,
            "url": self.url,
            "regexp": self.regex,
            "active": self.active,
            "label": self.label
        }


class WebsiteTag(db.Model):
    __tablename__ = 'website_tag'
    __table_args__ = {"schema": "my_schema"}
    tag = db.Column(db.String(200), primary_key=True)
    website_url = db.Column(db.String(200), db.ForeignKey('my_schema.website.url', ondelete='CASCADE'),
                            primary_key=True)

    def __init__(self, tag):
        self.tag = tag

    def __str__(self) -> str:
        return "(Tag : {0})".format(self.tag)

    def __repr__(self):
        return "(Tag : {0})".format(self.tag)


class CrawledData(db.Model):
    __tablename__ = 'crawled_data'
    __table_args__ = {"schema": "my_schema"}
    url = db.Column(db.String(200), db.ForeignKey('my_schema.website.url', ondelete='CASCADE'), primary_key=True)
    crawl_time = db.Column(db.Time, nullable=False)
    title = db.Column(db.String(200), nullable=True)

    def __init__(self, url, crawl_time, title):
        self.url = url
        self.crawl_time = crawl_time
        self.title = title

    def __str__(self) -> str:
        return "(URL : {0}, Crawl Time : {1}, Title : {2} )".format(self.url, self.crawl_time,
                                                                    self.title)

    def __repr__(self):
        return "(URL : {0}, Crawl Time : {1}, Title : {2} )".format(self.url, self.crawl_time, self.title)

    def toJSON(self):
        return {
            'url': self.url,
            'crawl_time': self.crawl_time,
            'title': self.title
        }

    def to_dict(self):
        return {
            'url': self.url,
            'crawl_time': str(self.crawl_time),
            'title': self.title
        }


class CrawledDataLink(db.Model):
    __tablename__ = 'crawled_data_link'
    __table_args__ = {"schema": "my_schema"}
    link = db.Column(db.String(200), nullable=False, primary_key=True)
    crawled_data_url = db.Column(db.String(200), db.ForeignKey('my_schema.crawled_data.url', ondelete='CASCADE'),
                                 primary_key=True)
    crawl_time = db.Column(db.Time)
    title = db.Column(db.String(200))

    def __init__(self, link, url, crawl_time, title):
        self.link = link
        self.crawled_data_url = url
        self.crawl_time = crawl_time
        self.title = title

    def __str__(self) -> str:
        return "(Link : {0})".format(self.link)


class Execution(db.Model):
    __tablename__ = 'executions'
    __table_args__ = {"schema": "my_schema"}
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    website_url = db.Column(db.String(200), db.ForeignKey('my_schema.website.url', ondelete='CASCADE'),
                            primary_key=True)
    status = db.Column(db.String(200))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    nr_of_sites_crawled = db.Column(db.Integer)

    def __init__(self, website_url=None, status=None, start=None, end=None, nrSites=None):
        self.website_url = website_url
        self.status = status
        self.start_time = start
        self.end_time = end
        self.nr_of_sites_crawled = nrSites

    def copy(self, execution):
        self.id = execution.id
        self.website_url = execution.website_url
        self.status = execution.status
        self.start_time = execution.start_time
        self.end_time = execution.end_time
        self.nr_of_sites_crawled = execution.nr_of_sites_crawled

    def toJSON(self):
        return {
            'id': self.id,
            'website_url': self.website_url,
            'status': self.status,
            'start_time': str(self.start_time),
            'end_time': str(self.end_time),
            'nr_of_sites_crawled': self.nr_of_sites_crawled
        }
