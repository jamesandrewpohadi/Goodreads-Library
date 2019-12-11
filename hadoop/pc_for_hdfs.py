import pyspark
import sys
from pyspark.sql import SparkSession, SQLContext
from operator import add

from pyspark.sql.types import *
import pyspark.sql.functions as f
from pyspark.sql.functions import udf, col, lower, avg

# spark = SparkSession.builder.master("local").appName("Goodreads-pearson-correlation").getOrCreate()
# sc = spark.sparkContext
# sqlContext = SQLContext(sc)
sc = pyspark.SparkContext("spark://{}:7077".format(sys.argv[1]), "Goodreads-pearson-correlation")
sc.setLogLevel("ERROR")
sqlContext = SQLContext(sc)

schema = StructType([
    StructField("asin", StringType(), nullable=False),
    StructField("helpful", StringType(), nullable=True),
    StructField("overall", IntegerType(), nullable=True),
    StructField("reviewText", StringType(), nullable=False),
    StructField("reviewTime", StringType(), nullable=True),
    StructField("reviewerID", StringType(), nullable=True),
    StructField("reviewerName", StringType(), nullable=True),
    StructField("summary", StringType(), nullable=True),
    StructField("unixReviewTime", FloatType(), nullable=True)
    ]
)

# meta_kindle_data = spark.read.json('meta_Kindle_Store.json')
# price_data = meta_kindle_data.select('asin', 'price')
# price_data = price_data.na.fill(0)
meta_kindle_data = sqlContext.read.json('hdfs://{}:9000/user/ubuntu/meta_kindle.json'.format(sys.argv[1]))
price_data = meta_kindle_data.select('asin', 'price')
price_data = price_data.na.fill(0)

# data = spark.read.csv('kindle_reviews.csv', schema = schema).cache()
# data_review_text = data.select('asin', 'reviewText')
data = sqlContext.read.csv('hdfs://{}:9000/user/ubuntu/kindle_reviews.tsv'.format(sys.argv[1]), schema = schema, sep = '\t').cache()
data_review_text = data.select('asin', 'reviewText')

#To calculate the number of words in a review:
num_of_words_each_review = data_review_text.withColumn('wordCountPerReview', f.size(f.split(f.col('reviewText'), ' ')))
review_length_mean = num_of_words_each_review.groupBy('asin').sum('wordCountPerReview')

combined = price_data.join(review_length_mean,'asin')

def mapper(w):
    x = w[1]
    y = w[2]
    return 'r_xy',(1,x,y,x*y,x**2,y**2)

def reducer(x,y):
    return x[0]+y[0],x[1]+y[1],x[2]+y[2],x[3]+y[3],x[4]+y[4],x[5]+y[5]

def mapR(a):
    val = a[1]
    n = val[0]
    x = val[1]
    y = val[2]
    xy = val[3]
    x2 = val[4]
    y2 = val[5]
    r_xy = (n*xy-x*y)/((n*x2-x**2)*(n*y2-y**2))**(1/2)
    return a[0],r_xy

rdd3 = combined.rdd.map(mapper)
rdd3 = rdd3.reduceByKey(reducer)
rdd3 = rdd3.map(mapR)
print(rdd3.collect())
