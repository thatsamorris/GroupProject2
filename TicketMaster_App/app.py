import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.ext.declarative import declarative_base
Base1 = declarative_base()

from sqlalchemy import Column, Integer, String, Float


app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/TM_DATA.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
#Samples_Metadata = Base.classes.sample_metadata

City_data = Base.classes.CITY_DATA1
Cities = Base.classes.city_names
#Venue_data = Base.classes.venue_data2
Venue_data = Base.classes.city_venue

# class Venue_data(Base1):
#   __tablename__ = "city_venue"
#   id = Column(Integer, primary_key=True)
#   venue = Column(String)
#   city = Column(String)
#   address = Column(String)
#   state = Column(String)
#   zipcode = Column(String)
#   latitude = Column(Float)
#   longitude = Column(Float)
#   url = Column(String)





#session = Session(db.engine)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/names")
def names():
    """Return a list of city names."""
   # print('in names')
    # Use Pandas to perform the sql query
    stmt = db.session.query(Cities).statement

    df = pd.read_sql_query(stmt, db.session.bind)
    #print(df)

    data = {
        "city": df.city_name.tolist()
    }
    
    #print('data', data)
    # Return a list of cities 
    return jsonify(data)


# @app.route("/metadata/<sample>")
# def sample_metadata(sample):
#     """Return the MetaData for a given sample."""
#     sel = [
#         Samples_Metadata.sample,
#         Samples_Metadata.ETHNICITY,
#         Samples_Metadata.GENDER,
#         Samples_Metadata.AGE,
#         Samples_Metadata.LOCATION,
#         Samples_Metadata.BBTYPE,
#         Samples_Metadata.WFREQ,
#     ]

#     results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

#     # Create a dictionary entry for each row of metadata information
#     sample_metadata = {}
#     for result in results:
#         sample_metadata["sample"] = result[0]
#         sample_metadata["ETHNICITY"] = result[1]
#         sample_metadata["GENDER"] = result[2]
#         sample_metadata["AGE"] = result[3]
#         sample_metadata["LOCATION"] = result[4]
#         sample_metadata["BBTYPE"] = result[5]
#         sample_metadata["WFREQ"] = result[6]

#     print(sample_metadata)
#     return jsonify(sample_metadata) 


@app.route("/cities/<city>")
def city(city):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    #     results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()
    print('B4 Query')
    stmt = db.session.query(City_data).statement

    df = pd.read_sql_query(stmt, db.session.bind)
    
    # print ('in cities', city)
    # Filter the data based on the sample number and
    # only keep rows with values above 1
    city_data = df.loc[df["City"] == city, ["eventname", "Date", "Classification", "Latitude", "Longitude", "City", "venue"]]
    #city_data = df.loc[:, ["eventname", "Date", "Classification", "Latitude", "Longitude", "City", "venue"]]
    
    city_data["frmtdDate"] = city_data["Date"]

#print('test' , city_data)
    
    print('b4 iterrows')
    
    
    city_data = city_data.loc[city_data["Date"] < "2019-01-31", ["eventname", "Date", "Classification", "Latitude", "Longitude", "City", "venue"]]
    
        #print ('city2', city_data)
    # Format the data to send as json
    data = {
        "eventname": city_data.eventname.values.tolist(),
        "Date": city_data.Date.tolist(),
        "Classification": city_data.Classification.tolist(),
        "Latitude": city_data.Latitude.values.tolist(),
        "Longitude": city_data.Longitude.values.tolist(),
        "City_name": city_data.City.tolist(),
        "Venue":     city_data.venue.tolist()
        #,        "frmtdDate":  city_data.frmtdDate.tolist()
    }
    #print(data)
    return jsonify(data)


@app.route("/chart/<city>")
def chart(city):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    #     results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()



    results = db.session.query(func.count(City_data.Classification), City_data.Classification, City_data.dte_wk).group_by(City_data.dte_wk, City_data.Classification  ).filter(City_data.City== city).filter(City_data.Date < '2019-02-01').all()

    event_cnt = []
    classification = []
    mnthWk = []

    for result in results:
        event_cnt.append(result[0])
        classification.append(result[1])
        mnthWk.append(result[2])

        #print ('city2', city_data)
    # Format the data to send as json
    data = {
        "EventCnt": event_cnt,
        "Classification": classification,       
        "Week":  mnthWk
    }
   # print(data)
    return jsonify(data)

@app.route("/venue/<city>")
def venue(city):
    print("in /venue")

    results = db.session.query(func.count(Venue_data.venue), Venue_data.venue, Venue_data.city).group_by(Venue_data.venue, Venue_data.city  ).filter(Venue_data.city== city).all()

    venue_cnt = []
    venue = []
    city = []

    for result in results:
        venue_cnt.append(result[0])
        venue.append(result[1])
        city.append(result[2])

        #print ('city2', city_data)
    # Format the data to send as json
    data = {
        "venue": venue
    }


    
    # stmt = db.session.query(Venue_data).filter(Venue_data.city == city).statement
    # df = pd.read_sql_query(stmt, db.session.bind)

    # print(df)


    # data = {
    #     "venue": df.venue.tolist(),
    #     "city":  df.city.tolist(),
    #     "address": df.address.tolist(),
    #     "zipcode": df.zipcode.tolist(),
    #     "latitude": df.latitude.values.tolist(),
    #     "longitude": df.longitude.values.tolist(),
    #     "url":     df.url.tolist()
    # }
    #print(data)

    return jsonify(data)

@app.route("/venueinfo/<venue>")
def venueinfo(venue):
    print("in /venueinfo")

    # results = db.session.query(func.count(Venue_data.venue), Venue_data.venue, Venue_data.city).group_by(Venue_data.venue, Venue_data.city  ).filter(Venue_data.city== city).all()

    # venue_cnt = []
    # venue = []
    # city = []

    # for result in results:
    #     venue_cnt.append(result[0])
    #     venue.append(result[1])
    #     city.append(result[2])

    #     #print ('city2', city_data)
    # # Format the data to send as json
    # data = {
    #     "venue": venue
    # }


    
    stmt = db.session.query(Venue_data).filter(Venue_data.venue == venue).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    print(df)


    data = {
        "venue": df.venue.tolist(),
        "city":  df.city.tolist(),
        "address": df.address.tolist(),
        "zipcode": df.zipcode.tolist(),
        "latitude": df.latitude.values.tolist(),
        "longitude": df.longitude.values.tolist(),
        "url":     df.url.tolist()
    }
    #print(data)

    return jsonify(data)
   


if __name__ == "__main__":
    app.run()
