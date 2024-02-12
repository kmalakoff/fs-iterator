var Iterator = require('.')

var i = 0;

var iterator = new Iterator('/Users/kevin');
iterator.forEach((entry) => { if(i++%1000===0) console.log(entry.fullPath); }, { concurrency: Infinity }, function(err) {
  console.log('DONE') 
})
