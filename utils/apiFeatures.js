class ApiFeatures {
  constructor(query, queryString) {//query from mongoose //querystring from express(url)(req.query)
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //     console.log(queryString) //it returns in form of obj that u can filter using it 
    const queryObj = { ...this.queryString };// making a hard copy of req.body obj so if u changed something the original source eill not be affected (queryobj does not refers to req.query it's just a copy ) 
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
      //  const tours= await Tour.find()
  // const tours=await Tour.find().where('difficulty').equals('easy')
  

    //2) advanced filtering (using operators [lte/lt/gte/gt] before = in url )
    //(req.query ) returns same obj used to filter in moongo but without $ so u have to replace each operator in url with $operator
  
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //regular exp \b to apply it for exact words only , /g to apply not for first word founded only but all , match is these words , if nothing matches so there is nothing will happen  
 //const query= Tour.find(queryObj) //first way to filter /query is to query as provide in moongo 
    this.query = this.query.find(JSON.parse(queryStr));// advanced filter

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //(if there is more than one sort so u have to split to make each a string , and then join them in one string to match query of mongoos and ordering by priority  )
      this.query = this.query.sort(sortBy);
    } else { //default string
      this.query = this.query.sort('-createdAt');//- means decendent order
    }

    return this;
  }

// //limit (return only specific fields )
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); //select('name price ...')
      this.query = this.query.select(fields);//include these fields
    } else {
      this.query = this.query.select('-__v'); //- means exclude this field (created by moongo)  //another way to exclude a field is to put select= false in schema
    }

    return this;
  }

  paginate() {
    //page=3&limit=10 
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;//u have to skip 20

    this.query = this.query.skip(skip).limit(limit);

    return this;//cause you use in controllers alot of methods and each returns a query to do on it so u must return that query obj
  }
}
module.exports = ApiFeatures;