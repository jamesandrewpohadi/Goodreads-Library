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
data = sqlContext.read.csv('hdfs://{}:9000/user/ubuntu/kindle_reviews.tsv'.format(sys.argv[1]), schema = schema, sep = '\t').cache()
data_review_text = data.select('reviewText')

#To calculate the number of words in a review:
df = data_review_text.withColumn('wordCountPerReview', f.size(f.split(f.col('reviewText'), ' ')))
# df.show()




#To calculate the number of times a word appears in all the reviews
df.select(f.sum('wordCountPerReview')).collect()
dfw = df.withColumn('word', f.explode(f.split(f.col('reviewText'), ' ')))\
    .groupBy('word')\
    .count()\
    .sort('count', ascending=False)
# dfw.show() 

list_of_words = dfw.select('word').rdd.flatMap(lambda x: x).collect()
# print(list_of_words[0][0])
# print("LIST OF WORDS:\n", list_of_words)




def calc_idf(given_word):
    #Total number of documents:
    total_num_of_docs = data_review_text.count()
    #Calculate the number documents the given word appears in:
    reviews_with_given_word = data_review_text.filter(data_review_text.reviewText.contains(given_word))
    #reviews_with_given_word.show()
    num_of_docs_given_word_is_in = reviews_with_given_word.count()
    #The IDF:
    if(num_of_docs_given_word_is_in != 0):
        idf = math.log(total_num_of_docs/num_of_docs_given_word_is_in)
    return idf

#tf-idf:
def calc_tfidf(given_word):
    #tf:
    print("Calculating the TF first...")
    df2 = df.withColumn('word', f.explode(f.split(f.col('reviewText'), ' ')))\
    .groupBy('word', 'reviewText')\
    .count()\
    .sort('count', ascending = False)\
    .withColumn('sum',f.size(f.split(f.col('reviewText'), ' ')))

    df2 = df2.withColumn('tf',f.col('count')/f.col('sum'))
    print("The TF is:")
    # df2.show()

    #idf:
    print("Calculating IDF...")
    idf_ans = calc_idf(given_word)
    print("The IDF is: ", idf_ans)

    #tf-idf:
    print("\nThe TF-IDF is:")
    df2 = df2.withColumn('tf-idf', f.col('tf')*idf_ans)
    df2.show()
    #df2.write.save('hdfs://{}:9000/user/ubuntu/'.format(sys.argv[1]), format='parquet', mode='append')


for word in list_of_words:
    print("\nComputing he TF-IDF of the word '", word, " ':\n")
    calc_tfidf(word)


# given_word = "Sanjay"
# print("\nComputing he TF-IDF of the word '", given_word, " ':\n")
# calc_tfidf(given_word)
# idf_ans = calc_idf("Sanjay")
# print("The IDF function returns:", idf_ans)


# idf_dict = {}
# #Total number of documents:
# total_num_of_docs = data_review_text.count()
# for word in df2.word:
#     #Calculate the number documents the given word appears in:
#     reviews_with_given_word = data_review_text.filter(data_review_text.reviewText.contains(word))
#     reviews_with_given_word.show()
#     num_of_docs_given_word_is_in = reviews_with_given_word.count()
#     #The IDF:
#     if(num_of_docs_given_word_is_in != 0):
#         idf = math.log(total_num_of_docs/num_of_docs_given_word_is_in)
#         idf_dict.update({word, idf})
# print("The IDF:", idf)
