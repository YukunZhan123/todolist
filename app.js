//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB ', { useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "1"
});

const item2 = new Item({
  name: "2"
});

const item3 = new Item({
  name: "3"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const day = date.getDate();

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}).then(function(foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems);
    res.redirect("/");
  }else{
  res.render("list", {listTitle: day, newListItems: foundItems});}
});



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  console.log(listName);

  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();

    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(doc){
      doc.items.push(item);
      doc.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.list;
  if(listName === day){
    Item.findByIdAndRemove(id).then(()=>{res.redirect("/");}).catch((err)=>{console.log(err)});
  }else{
    List.findOne({name:listName}).then((doc)=>{
      console.log(id);
      doc.items = doc.items.filter(item=> item._id.toString() !== id);

      console.log(doc.items);
      
      doc.save();
      res.redirect("/"+listName);
    });
  }
})

app.get("/:name", function(req, res) {
  
  const itemName = req.params.name;

  List.findOne({name:itemName}).then(function(doc){
    // console.log(doc);
    if(doc){
      console.log("found");
      res.render("list", {listTitle: itemName, newListItems: doc.items});
    }else{
      console.log("cannot find");
      const list = new List({
        name: itemName,
        items: defaultItems
    
      });
      list.save();
      res.redirect("/"+itemName);
    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3001, function() {
  console.log("Server started on port 3001");
});
