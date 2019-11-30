drop table if exists kindle_reviews;

create table kindle_reviews ( 
    asin varchar(10), 
    helpful varchar(15), 
    overall int(1), 
    reviewText text, 
    reviewTime varchar(11), 
    reviewerID varchar(25), 
    reviewerName varchar(80), 
    summary varchar(750), 
    unixReviewTime int(15) 
);

load data local infile "kindle_reviews.csv" into table kindle_reviews fields terminated by ',' enclosed by '"' escaped by '"' lines terminated by '\n' IGNORE 1 LINES;