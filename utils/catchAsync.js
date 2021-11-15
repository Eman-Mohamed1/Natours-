//instead of try catch block use this for all methods 
module.exports = (fn)=>{

return (req,res,next)=>{
fn(req,res,next)
.catch(next)
}

}