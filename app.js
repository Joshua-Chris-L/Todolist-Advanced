//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

// create new moongose Document
const itemsSchema ={
  name: String
};
// the const name is ususlly capital letter
const Item = mongoose.model("Item", itemsSchema);
//defaultItem
const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "Hit this to delete a new item"
});

//Default Item and Insert
const defaultItem = [item1, item2, item3];

//List item
const listSchema = {
name: String,
items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];
app.get("/", function(req, res) {
//find all items
Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItem, function(err){
        if(!err){
          console.log("Succesfully Updated to database");
        }else{console.log(err);}
      });
      res.redirect("/");
    }else{res.render("list", {listTitle: "Today", newListItems: foundItems});}

  });
});

// if (req.body.list === "Work") {
//   workItems.push(item);
//   res.redirect("/work");
// } else {
//   items.push(item);
//   res.redirect("/");
// }
app.get("/:customListName",  function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundlists){
    if(!err){
      if(!foundlists){
        //create a new list
        const list = new List({
          name: customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        // show an existing list
        res.render("list", {listTitle: customListName, newListItems: foundlists.items});
      }
    }
  });

});


app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name: itemName
});

if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundlist){
  foundlist.items.push(item);
  foundlist.save();
  res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Sucessfully Deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}}, function(err, foundlist){
        if(!err){
          res.redirect("/" + listName);
        }
    });
  }
});
//app.get("/work", function(req,res){
//  res.render("list", {listTitle: "Work List", newListItems: workItems});
//});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
