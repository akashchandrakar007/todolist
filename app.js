//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require('lodash');
const date = require(__dirname + "/date.js");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

 mongoose.connect("mongodb+srv://admin-akash:"+process.env.MONGO_PASSWORD+"@cluster0.2hf0y.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true});

 const itemSchema={
   name:String
 };

 const Item=mongoose.model("Item",itemSchema);

 const i1=new Item({
   name:"Hit add button to add item in todolist"
 });
 // const i2=new Item({
 //   name:"Add as many as you want"
 // });
 const i3=new Item({
   name:"Hit checkbox to delete item"
 });
 const defaulItems=[i1,i3];

 const listSchema={
   name:String,
   listItems:[itemSchema]
 };

 const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,items){
    if(items.length===0){
      Item.insertMany(defaulItems,function(err){
        if(err)  {
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle:"Today", newListItems:items });
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  if(itemName.trim().length!==0){
  const newItem=new Item({
    name:itemName
  });
  if(listName==="Today"){
  newItem.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.listItems.push(newItem);
    foundList.save();
    res.redirect("/"+listName);
  });
}
}
else{
  res.redirect("/");
}

});

app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(id,function(err){
    if(!err){

      res.redirect("/");
    }
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull :{listItems:{_id:id}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
  }
});

app.get("/:name",function(req,res){

  const listName=_.capitalize(req.params.name);

List.findOne({name:listName},function(err,foundList){
    if(!err){
      //List is created
      if(!foundList){
      const list=new List({
        name:listName,
        listItems:defaulItems
      });
      list.save();
      res.redirect("/"+listName);

    }
    else{
      res.render("list", {listTitle:foundList.name, newListItems: foundList.listItems});
    }
  }
})

});

app.get("/about", function(req, res){
  res.render("about");
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }


app.listen(3000, function() {
  console.log("Server has started Successfully");
});
