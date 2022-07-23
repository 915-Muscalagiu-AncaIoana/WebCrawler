FROM python:3.6-slim-buster

COPY . .

RUN pip install -r ./requirements.txt

EXPOSE 5000

CMD ["gunicorn", "-b", ":5000", "web_crawler_api.main:app"]

