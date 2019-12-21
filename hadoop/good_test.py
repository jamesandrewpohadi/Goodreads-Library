import math
import pyspark
from pyspark.sql import SparkSession, SQLContext

from pyspark.sql.types import *
import pyspark.sql.functions as f
from pyspark.sql.functions import udf, col
import sys

#spark = SparkSession.builder.appName("Goodreads-tf-idf").getOrCreate()
sc = pyspark.SparkContext("spark://{}:7077".format(sys.argv[1]),"Goodreads-tf-idf")
sc.setLogLevel("ERROR")
sqlContext = SQLContext(sc)

schema = StructType([
    StructField("asin", StringType(), nullable=False),
    StructField("helpful", StringType(), nullable=True),
    StructField("overall", IntegerType(), nullable=True),
    StructField("reviewText", StringType(), nullable=True),
    StructField("reviewTime", StringType(), nullable=True),
    StructField("reviewerID", StringType(), nullable=True),
    StructField("reviewerName", StringType(), nullable=True),
    StructField("summary", StringType(), nullable=True),
    StructField("unixReviewTime", FloatType(), nullable=True)
    ]
)
#data = sc.textFile('hdfs://ec2-54-169-97-130.ap-southeast-1.compute.amazonaws.com:9000/user/ubuntu/kindle_reviews.tsv')

def split_lines_count(x):
    words = x[1].lower().split(' ')
    n = len(words)
    return (x[0][:10]+'...',[(word,n) for word in words])

def count_tf(x):
    id = x[0][0]
    word = x[0][1]
    total = x[0][2]
    count = x[1]
    return (word,(id,count/total))

def toCSVLine(data):
  return ','.join(str(d) for d in data)

data = sqlContext.read.csv('hdfs://{}:9000/user/ubuntu/kindle_reviews.tsv'.format(sys.argv[1]), schema = schema, sep = '\t').cache()
data = data.select('reviewText','reviewText')
data = data.na.drop()
count = data.count()
data = data.rdd

tf = data.map(lambda x: split_lines_count(x))#.flatMap(lambda x:x['id'])
tf = tf.flatMapValues(lambda x: x)
tf = tf.map(lambda x: ((x[0],x[1][0],x[1][1]),1))
tf = tf.reduceByKey(lambda x,y: x+y)
tf = tf.map(count_tf).cache().cache()
idf = tf.map(lambda x: (x[0],1))
idf = idf.reduceByKey(lambda x,y: x+y)
idf = idf.map(lambda x: (x[0],math.log(count/x[1])))
tfidf = tf.join(idf)
tfidf = tfidf.map(lambda x: (x[0],x[1][0][0],x[1][0][1]*x[1][1]))

schema = StructType([
    StructField("word", StringType(), nullable=True),
    StructField("reviewText", StringType(), nullable=True),
    StructField("tfidf", FloatType(), nullable=True),
    ]
)
df3 = sqlContext.createDataFrame(tfidf, schema)
df3.write.csv('tfidf_result')

sc.stop()