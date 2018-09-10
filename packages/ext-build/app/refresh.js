const chalk = require('chalk');
const util = require('../util.js')

class refresh {
  constructor(options) {
    util.senchaCmd(['app','refresh']);
  }
}
module.exports = refresh




    //console.log(`${chalk.black("[INF] sencha-build app refresh")}`)


    // function hook_stdout(callback) {
    //   var old_write = process.stdout.write
    //   process.stdout.write = (function(write) {
    //       return function(string, encoding, fd) {
    //           write.apply(process.stdout, arguments)
    //           callback(string, encoding, fd)
    //       }
    //   })(process.stdout.write)
    //   return function() {
    //       process.stdout.write = old_write
    //   }
    // }
    
    // var unhook = hook_stdout(function(string, encoding, fd) {
    //   console.log('stdout: ' + string)
    // })
    
    // console.log('c')
    // console.log('d')
    
    // //unhook()
    // //console.log('e')


//     var i = 1;                     //  set your counter to 1

//     function myLoop () {           //  create a loop function
//        setTimeout(function () {    //  call a 3s setTimeout when the loop is called
//           console.log('hello ' + i);          //  your code here
//           i++;                     //  increment the counter
//           if (i < 5) {            //  if the counter < 10, call the loop function
//              myLoop();             //  ..  again which will trigger another 
//           }                        //  ..  setTimeout()
//        }, 2000)
//     }
    




// function getCoffee() {
//   console.log('before coffee')
//   return new Promise(resolve => {
//     setTimeout(() => 
//     {
//       console.log('during coffee')
//       resolve('☕')
//     }
//       , 5000
//     ); // it takes 2 seconds to make coffee
//   })
//   console.log('after coffee')
// }

//   async function go() {
//     try {
//       // but first, coffee
//       const coffee = await getCoffee();
//       console.log(coffee); // ☕
//       // // then we grab some data over an Ajax request
//       // const wes = await axios('https://api.github.com/users/wesbos');
//       // console.log(wes.data); // mediocre code
//       // // many requests should be concurrent - don't slow things down!
//       // // fire off three requests and save their promises
//       // const wordPromise = axios('http://www.setgetgo.com/randomword/get.php');
//       // const userPromise = axios('https://randomuser.me/api/');
//       // const namePromise = axios('https://uinames.com/api/');
//       // // await all three promises to come back and destructure the result into their own variables
//       // const [word, user, name] = await Promise.all([wordPromise, userPromise, namePromise]);
//       // console.log(word.data, user.data, name.data); // cool, {...}, {....}
//     } catch (e) {
//       console.error(e); // 💩
//     }
//   }
  
//   console.log('before go')
//   go();
// //  const coffee = await getCoffee();
// //  console.log(coffee); // ☕


//   console.log('after go')


//     // console.log('before await');
//     // var promise = await util.senchaCmd(['app','refresh'])
//     // console.log('after await');

//     // promise.then(function(result) {
//     //   console.log('done');
//     // }, function(err) {
//     //   console.log(err);
//     // })
//     // console.log('after all of this');

// myLoop()

// console.log('after myLoop')

