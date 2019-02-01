!function(){function promisifyRequest(request){return new Promise(function(resolve,reject){request.onsuccess=function(){resolve(request.result)},request.onerror=function(){reject(request.error)}})}function promisifyRequestCall(obj,method,args){var request,p=new Promise(function(resolve,reject){promisifyRequest(request=obj[method].apply(obj,args)).then(resolve,reject)});return p.request=request,p}function proxyProperties(ProxyClass,targetProp,properties){properties.forEach(function(prop){Object.defineProperty(ProxyClass.prototype,prop,{get:function(){return this[targetProp][prop]},set:function(val){this[targetProp][prop]=val}})})}function proxyRequestMethods(ProxyClass,targetProp,Constructor,properties){properties.forEach(function(prop){prop in Constructor.prototype&&(ProxyClass.prototype[prop]=function(){return promisifyRequestCall(this[targetProp],prop,arguments)})})}function proxyMethods(ProxyClass,targetProp,Constructor,properties){properties.forEach(function(prop){prop in Constructor.prototype&&(ProxyClass.prototype[prop]=function(){return this[targetProp][prop].apply(this[targetProp],arguments)})})}function proxyCursorRequestMethods(ProxyClass,targetProp,Constructor,properties){properties.forEach(function(prop){prop in Constructor.prototype&&(ProxyClass.prototype[prop]=function(){return obj=this[targetProp],(p=promisifyRequestCall(obj,prop,arguments)).then(function(value){if(value)return new Cursor(value,p.request)});var obj,p})})}function Index(index){this._index=index}function Cursor(cursor,request){this._cursor=cursor,this._request=request}function ObjectStore(store){this._store=store}function Transaction(idbTransaction){this._tx=idbTransaction,this.complete=new Promise(function(resolve,reject){idbTransaction.oncomplete=function(){resolve()},idbTransaction.onerror=function(){reject(idbTransaction.error)},idbTransaction.onabort=function(){reject(idbTransaction.error)}})}function UpgradeDB(db,oldVersion,transaction){this._db=db,this.oldVersion=oldVersion,this.transaction=new Transaction(transaction)}function DB(db){this._db=db}proxyProperties(Index,"_index",["name","keyPath","multiEntry","unique"]),proxyRequestMethods(Index,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),proxyCursorRequestMethods(Index,"_index",IDBIndex,["openCursor","openKeyCursor"]),proxyProperties(Cursor,"_cursor",["direction","key","primaryKey","value"]),proxyRequestMethods(Cursor,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(methodName){methodName in IDBCursor.prototype&&(Cursor.prototype[methodName]=function(){var cursor=this,args=arguments;return Promise.resolve().then(function(){return cursor._cursor[methodName].apply(cursor._cursor,args),promisifyRequest(cursor._request).then(function(value){if(value)return new Cursor(value,cursor._request)})})})}),ObjectStore.prototype.createIndex=function(){return new Index(this._store.createIndex.apply(this._store,arguments))},ObjectStore.prototype.index=function(){return new Index(this._store.index.apply(this._store,arguments))},proxyProperties(ObjectStore,"_store",["name","keyPath","indexNames","autoIncrement"]),proxyRequestMethods(ObjectStore,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),proxyCursorRequestMethods(ObjectStore,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),proxyMethods(ObjectStore,"_store",IDBObjectStore,["deleteIndex"]),Transaction.prototype.objectStore=function(){return new ObjectStore(this._tx.objectStore.apply(this._tx,arguments))},proxyProperties(Transaction,"_tx",["objectStoreNames","mode"]),proxyMethods(Transaction,"_tx",IDBTransaction,["abort"]),UpgradeDB.prototype.createObjectStore=function(){return new ObjectStore(this._db.createObjectStore.apply(this._db,arguments))},proxyProperties(UpgradeDB,"_db",["name","version","objectStoreNames"]),proxyMethods(UpgradeDB,"_db",IDBDatabase,["deleteObjectStore","close"]),DB.prototype.transaction=function(){return new Transaction(this._db.transaction.apply(this._db,arguments))},proxyProperties(DB,"_db",["name","version","objectStoreNames"]),proxyMethods(DB,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(funcName){[ObjectStore,Index].forEach(function(Constructor){Constructor.prototype[funcName.replace("open","iterate")]=function(){var arr,args=(arr=arguments,Array.prototype.slice.call(arr)),callback=args[args.length-1],nativeObject=this._store||this._index,request=nativeObject[funcName].apply(nativeObject,args.slice(0,-1));request.onsuccess=function(){callback(request.result)}}})}),[Index,ObjectStore].forEach(function(Constructor){Constructor.prototype.getAll||(Constructor.prototype.getAll=function(query,count){var instance=this,items=[];return new Promise(function(resolve){instance.iterateCursor(query,function(cursor){cursor?(items.push(cursor.value),void 0===count||items.length!=count?cursor.continue():resolve(items)):resolve(items)})})})});var exp={open:function(name,version,upgradeCallback){var p=promisifyRequestCall(indexedDB,"open",[name,version]),request=p.request;return request.onupgradeneeded=function(event){upgradeCallback&&upgradeCallback(new UpgradeDB(request.result,event.oldVersion,request.transaction))},p.then(function(db){return new DB(db)})},delete:function(name){return promisifyRequestCall(indexedDB,"deleteDatabase",[name])}};"undefined"!=typeof module?(module.exports=exp,module.exports.default=module.exports):self.idb=exp}();class DBHelper{static RESTAURANTS_DATABASE_URL(id=null){return id?`http://localhost/server-php-mws-restaurant/server.php?id=${id}`:"http://localhost/server-php-mws-restaurant/server.php?getall="}static REVIEWS_DATABASE_URL(restaurant_id=null){return restaurant_id?`http://localhost/server-php-mws-restaurant/server.php?reviews_restaurant_id=${restaurant_id}`:"http://localhost/server-php-mws-restaurant/server.php?reviews="}static openAdviseUser(advise,type){const modalOverlay=document.querySelector(".modal-overlay");modalOverlay.style.zIndex=9;const info_box=document.createElement("div");info_box.classList.add("info-box");const message=document.createElement("p");message.innerHTML=advise,info_box.appendChild(message),document.body.appendChild(info_box),"reload"==type?setTimeout(function(){location.reload(!0)},3e3):"hide"==type&&setTimeout(function(){modalOverlay.style.display="none",info_box.style.display="none"},3e3)}static openDatabase(){return navigator.serviceWorker?idb.open("restaurants-review",1,function(upgradeDb){let restaurantsStore,reviewsStore,reviewsOfflineStore,favoritesRestaurantsOfflineStore;switch(upgradeDb.oldVersion){case 0:restaurantsStore=upgradeDb.createObjectStore("restaurants",{keyPath:"id",autoIncrement:!0});case 1:(reviewsStore=upgradeDb.createObjectStore("reviews",{keyPath:"id",autoIncrement:!0})).createIndex("restaurant_id","restaurant_id",{unique:!1});case 2:reviewsOfflineStore=upgradeDb.createObjectStore("reviews-offline",{keyPath:"id",autoIncrement:!0});case 3:favoritesRestaurantsOfflineStore=upgradeDb.createObjectStore("favorites-restaurants-offline",{keyPath:"id"})}}):Promise.resolve()}static putValuesRestaurantsDatabase(){fetch(DBHelper.RESTAURANTS_DATABASE_URL()).then(function(response){if(response.ok)return response.json();return"Data not loaded"}).then(function(restaurants){DBHelper.openDatabase().then(function(db){const tx=db.transaction("restaurants","readwrite"),restaurantsStore=tx.objectStore("restaurants");for(let i=0;i<restaurants.length;i++)restaurantsStore.put(restaurants[i]);return tx.complete}).then(function(){console.log("Add restaurants")}).catch(function(){console.log("Transaction failed")})}).catch(function(){return"Network error"})}static putIsFavoriteRestaurantDatabase(id_restaurant,favorite,favoriteHTML){let is_favorite;is_favorite="true"==String(favorite)?"&is_favorite=false":"&is_favorite=true",console.log(DBHelper.RESTAURANTS_DATABASE_URL(id_restaurant)+is_favorite),fetch(DBHelper.RESTAURANTS_DATABASE_URL(id_restaurant)+is_favorite,{method:"GET","Accept-Charset":"utf-8","Content-Type":"text/plain"}).then(function(response){if(response.ok)return response.json();return"Data not loaded"}).then(function(restaurant){"true"==String(restaurant.is_favorite)?(favoriteHTML.innerHTML="&#9733;",favoriteHTML.setAttribute("data-favorite","true")):(favoriteHTML.innerHTML="&#9734;",favoriteHTML.setAttribute("data-favorite","false")),DBHelper.openDatabase().then(function(db){const tx=db.transaction("restaurants","readwrite");return tx.objectStore("restaurants").put(restaurant),tx.complete}).then(function(){console.log("Update favorite restaurant")}).catch(function(){console.log("Transaction failed")})}).catch(function(){DBHelper.putOfflineIsFavoriteRestaurantDatabase(id_restaurant,favorite,favoriteHTML);return"Network error"})}static putValuesReviewsDatabase(){fetch(DBHelper.REVIEWS_DATABASE_URL()).then(function(response){if(response.ok)return console.log(response),response.json();return"Data not loaded"}).then(function(reviews){DBHelper.openDatabase().then(function(db){const tx=db.transaction("reviews","readwrite"),reviewsStore=tx.objectStore("reviews");for(let i=0;i<reviews.length;i++)reviewsStore.put(reviews[i]);return tx.complete}).then(function(){console.log("Add reviews")}).catch(function(){console.log("Transaction failed")})}).catch(function(){return"Network error"})}static putOfflineValuesReviewDatabase(data_review,data_offline_review){DBHelper.openDatabase().then(function(db){const tx=db.transaction(["reviews","reviews-offline"],"readwrite");return tx.objectStore("reviews").put(data_review),tx.objectStore("reviews-offline").put(data_offline_review),tx.complete}).then(function(){console.log("Add review");DBHelper.openAdviseUser("No connection, the review will be sent as soon as possible thanks","reload")}).catch(function(){console.log("Transaction failed")})}static putOfflineIsFavoriteRestaurantDatabase(id_restaurant,favorite,favoriteHTML){let is_favorite;is_favorite="true"==String(favorite)?"false":"true";const data_offline_favorite_restaurant={id:id_restaurant,is_favorite:String(is_favorite)};DBHelper.openDatabase().then(function(db){return db.transaction("restaurants","readwrite").objectStore("restaurants").get(id_restaurant)}).then(function(restaurant){"true"==String(favorite)?restaurant.is_favorite="false":restaurant.is_favorite="true",DBHelper.openDatabase().then(function(db){const tx=db.transaction(["restaurants","favorites-restaurants-offline"],"readwrite");return tx.objectStore("restaurants").put(restaurant),tx.objectStore("favorites-restaurants-offline").put(data_offline_favorite_restaurant),tx.complete}).then(function(){"true"==favorite?(favoriteHTML.innerHTML="&#9734;",favoriteHTML.setAttribute("data-favorite","false")):(favoriteHTML.innerHTML="&#9733;",favoriteHTML.setAttribute("data-favorite","true")),console.log("Update favorite restaurant");DBHelper.openAdviseUser("No connection, the favorites restaurants will be sent as soon as possible thanks","hide")})}).catch(function(){console.log("Transaction failed")})}static getRestaurantsValuesDatabase(id=null,callback){if(id){DBHelper.openDatabase().then(function(db){return db.transaction("restaurants").objectStore("restaurants").get(id)}).then(function(restaurant_value){console.log(restaurant_value),callback(null,restaurant_value),console.log("Transaction success")}).catch(function(){console.log("Transaction failed")})}else{let arrayRestaurants=[];DBHelper.openDatabase().then(function(db){return db.transaction("restaurants").objectStore("restaurants").openCursor()}).then(function createArrayRestaurants(cursor){if(cursor)return arrayRestaurants.push(cursor.value),cursor.continue().then(createArrayRestaurants)}).then(function(){callback(null,arrayRestaurants),console.log("Transaction success")}).catch(function(){console.log("Transaction failed")})}}static getReviewsRestaurantValuesDatabase(restaurant_id,callback){let arrayReviews=[];DBHelper.openDatabase().then(function(db){return db.transaction("reviews").objectStore("reviews").index("restaurant_id").openCursor(restaurant_id)}).then(function createArrayReviewsRestaurant(cursor){if(cursor)return arrayReviews.push(cursor.value),cursor.continue().then(createArrayReviewsRestaurant)}).then(function(){callback(null,arrayReviews),console.log("Transaction success")}).catch(function(){console.log("Transaction failed")})}static fetchRestaurants(callback){fetch(DBHelper.RESTAURANTS_DATABASE_URL()).then(function(response){if(response.ok)return response.json();DBHelper.getRestaurantsValuesDatabase(null,callback)}).then(function(restaurants){callback(null,restaurants)}).catch(function(){DBHelper.getRestaurantsValuesDatabase(null,callback)})}static fetchReviewsRestaurant(restaurant_id,callback){fetch(DBHelper.REVIEWS_DATABASE_URL(restaurant_id)).then(function(response){if(response.ok)return response.json();DBHelper.getReviewsRestaurantValuesDatabase(restaurant_id,callback)}).then(function(reviews){callback(null,reviews)}).catch(function(){DBHelper.getReviewsRestaurantValuesDatabase(restaurant_id,callback)})}static fetchRestaurantById(id,callback){fetch(DBHelper.RESTAURANTS_DATABASE_URL(id)).then(function(response){if(response.ok)return response.json();DBHelper.getRestaurantsValuesDatabase(id,callback)}).then(function(restaurant){callback(null,restaurant)}).catch(function(){DBHelper.getRestaurantsValuesDatabase(id,callback)})}static fetchRestaurantByCuisine(cuisine,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error)callback(error,null);else{const results=restaurants.filter(r=>r.cuisine_type==cuisine);callback(null,results)}})}static fetchRestaurantByNeighborhood(neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error)callback(error,null);else{const results=restaurants.filter(r=>r.neighborhood==neighborhood);callback(null,results)}})}static fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error)callback(error,null);else{let results=restaurants;"all"!=cuisine&&(results=results.filter(r=>r.cuisine_type==cuisine)),"all"!=neighborhood&&(results=results.filter(r=>r.neighborhood==neighborhood)),callback(null,results)}})}static fetchNeighborhoods(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error)callback(error,null);else{const neighborhoods=restaurants.map((v,i)=>restaurants[i].neighborhood),uniqueNeighborhoods=neighborhoods.filter((v,i)=>neighborhoods.indexOf(v)==i);callback(null,uniqueNeighborhoods)}})}static fetchCuisines(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error)callback(error,null);else{const cuisines=restaurants.map((v,i)=>restaurants[i].cuisine_type),uniqueCuisines=cuisines.filter((v,i)=>cuisines.indexOf(v)==i);callback(null,uniqueCuisines)}})}static urlForRestaurant(restaurant){return`./restaurant.html?id=${restaurant.id}`}static imageUrlForRestaurant(){return"./img/"}static mapMarkerForRestaurant(restaurant,map){const restaurant_info=restaurant.name+", Cuisine: "+restaurant.cuisine_type+", Today open: "+findRestaurantCurrentDayOpeningTimeHTML(restaurant.operating_hours),coords=restaurant.latlng.split(","),Lat=coords[0].split(":"),Lng=coords[1].split(":");return restaurant.latlng={lat:Number(Lat[1].trim()),lng:Number(Lng[1].trim())},new google.maps.Marker({position:restaurant.latlng,url:DBHelper.urlForRestaurant(restaurant),title:restaurant_info,map,animation:google.maps.Animation.DROP})}static mapMarkerForRestaurantInfo(restaurant,map){return new google.maps.Marker({position:restaurant.latlng,url:DBHelper.urlForRestaurant(restaurant),title:restaurant.name,map,animation:google.maps.Animation.DROP})}}let restaurant,reviewsRestaurant;var map;DBHelper.putValuesRestaurantsDatabase(),DBHelper.putValuesReviewsDatabase(),window.initMap=(()=>{fetchReviewsRestaurantFromURL((error,reviews)=>{error&&console.log(error);const mediaReviews=document.getElementById("media-reviews");mediaReviews.innerHTML="Media reviews: "+calcMediaReviews(),mediaReviews.setAttribute("aria-label","Media reviews: "+calcMediaReviews())}),fetchRestaurantFromURL((error,restaurant)=>{if(error)console.log(error);else{const coords=restaurant.latlng.split(","),Lat=coords[0].split(":"),Lng=coords[1].split(":");restaurant.latlng={lat:Number(Lat[1].trim()),lng:Number(Lng[1].trim())},self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:restaurant.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurantInfo(self.restaurant,self.map)}})}),fetchRestaurantFromURL=(callback=>{if(self.restaurant)return void callback(null,self.restaurant);const id=getParameterByName("id");id?DBHelper.fetchRestaurantById(id,(error,restaurant)=>{self.restaurant=restaurant,restaurant?(fillRestaurantHTML(),callback(null,restaurant)):console.log(error)}):(error="No restaurant id in URL",callback(error,null))}),fetchReviewsRestaurantFromURL=(callback=>{if(self.reviewsRestaurant)return void callback(null,self.reviewsRestaurant);const id=getParameterByName("id");id?DBHelper.fetchReviewsRestaurant(id,(error,reviews)=>{self.reviewsRestaurant=reviews,reviews?(fillReviewsHTML(),callback(null,reviews)):console.log(error)}):(error="No restaurant id in URL",callback(error,null))}),fillRestaurantHTML=((restaurant=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=restaurant.name;const title=document.title;document.title=`${title} - ${restaurant.name}`;const address=document.getElementById("restaurant-address");address.innerHTML=restaurant.address,address.setAttribute("aria-label","Address: "+restaurant.address);const image=document.getElementById("restaurant-img");image.className="restaurant-img",image.alt=`Image of ${restaurant.name}`,image.src=`${DBHelper.imageUrlForRestaurant()}${restaurant.photograph_maxw}`;const cuisine=document.getElementById("restaurant-cuisine");cuisine.innerHTML=restaurant.cuisine_type,cuisine.setAttribute("aria-label","Cuisine: "+restaurant.cuisine_type),restaurant.operating_hours&&fillRestaurantHoursHTML(),fillRestaurantHoursSummaryHTML()}),fillRestaurantHoursHTML=((operatingHours=self.restaurant.operating_hours)=>{const dayHours=[],days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];operatingHours.split(",").forEach(function(v,i,a){const hours=a[i].slice(a[i].indexOf(":")+1,a[i].length);dayHours[days[i]]=hours});const hours=document.getElementById("restaurant-hours");let i=0;for(let key in dayHours){const row=document.createElement("tr");row.className=i%2!=0?"odd":"even";const day=document.createElement("td");day.innerHTML=key,row.appendChild(day);const time=document.createElement("td");time.innerHTML=dayHours[key].trim(),row.appendChild(time),hours.appendChild(row),i++}}),fillRestaurantHoursSummaryHTML=((operatingHours=self.restaurant.operating_hours)=>{const hours_summary=document.getElementById("hours-summary"),days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let string="Opening time: ",i=0;for(let key in operatingHours)0==i?(string+=days[i],operatingHours[days[i+1]]!=operatingHours[days[i]]&&(string+=" "+operatingHours[days[i]])):operatingHours[days[i]]==operatingHours[days[i-1]]?(string+=", "+days[i],operatingHours[days[i+1]]!=operatingHours[days[i]]&&(string+=" "+operatingHours[days[i]])):(string+="; "+days[i],operatingHours[days[i+1]]!=operatingHours[days[i]]&&(string+=" "+operatingHours[days[i]])),i++;hours_summary.innerHTML=string}),fillReviewsHTML=((reviews=self.reviewsRestaurant)=>{const container=document.getElementById("reviews-container");if(!reviews){const noReviews=document.createElement("p");return noReviews.innerHTML="No reviews yet!",void container.appendChild(noReviews)}const ul=document.getElementById("reviews-list");reviews.forEach(review=>{ul.appendChild(createReviewHTML(review))}),container.appendChild(ul)}),createReviewHTML=(review=>{const li=document.createElement("li"),article=document.createElement("article");article.className="cont-review",li.appendChild(article);const header=document.createElement("header");article.appendChild(header);const name=document.createElement("h3");name.className="name-review",name.innerHTML=review.name,header.appendChild(name);const date=document.createElement("p");date.className="date-review",date.innerHTML=new Date(Number(review.updatedAt)).toDateString(),header.appendChild(date);const div_cont=document.createElement("div");div_cont.className="body-review",article.appendChild(div_cont);const rating=document.createElement("p");rating.className="rating-review",rating.innerHTML=`Rating: ${review.rating}`,div_cont.appendChild(rating);const comments=document.createElement("p");return comments.className="comment-review",comments.innerHTML=review.comments,div_cont.appendChild(comments),li}),calcMediaReviews=((reviews=self.reviewsRestaurant)=>{if(reviews){let i,sum=0,media=0,num_reviews=reviews.length;for(i=0;i<num_reviews;i++)sum+=Number(reviews[i].rating);return media=(media=sum/num_reviews)>0?media.toFixed(2):"No reviews available"}return"No reviews available"}),fillBreadcrumb=((restaurant=self.restaurant)=>{const breadcrumb=document.getElementById("breadcrumb"),li=document.createElement("li");li.innerHTML=restaurant.name,breadcrumb.appendChild(li)}),getParameterByName=((name,url)=>{url||(url=window.location.href),name=name.replace(/[\[\]]/g,"\\$&");const results=new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`).exec(url);return results?results[2]?decodeURIComponent(results[2].replace(/\+/g," ")):"":null});const skip_link_restaurant_info=document.getElementById("skip-link-restaurant-info");if(null!==skip_link_restaurant_info){document.getElementById("restaurant-container");skip_link_restaurant_info.addEventListener("keydown",function(event){const key=event.charCode||event.keyCode;32!==key&&13!==key||restaurant_focus.focus()})}let focusedElementBeforeModal;const modal=document.querySelector(".modal"),modalOverlay=document.querySelector(".modal-overlay"),modalToggle=document.querySelector(".modal-toggle");function openModal(){focusedElementBeforeModal=document.activeElement,modal.addEventListener("keydown",function(e){9===e.keyCode&&(e.shiftKey?document.activeElement===firstTabStop&&(e.preventDefault(),lastTabStop.focus()):document.activeElement===lastTabStop&&(e.preventDefault(),firstTabStop.focus()));27===e.keyCode&&closeModal()}),modalOverlay.addEventListener("click",closeModal),modal.querySelector("#close-modal").addEventListener("click",closeModal);let focusableElements=modal.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'),firstTabStop=(focusableElements=Array.prototype.slice.call(focusableElements))[0],lastTabStop=focusableElements[focusableElements.length-1];modal.style.display="block",modalOverlay.style.display="block",firstTabStop.focus()}function closeModal(){modal.style.display="none",modalOverlay.style.display="none",focusedElementBeforeModal.focus()}modalToggle.addEventListener("click",openModal);const formSendReview=document.getElementById("form_send_review"),restaurant_id=getParameterByName("id"),field_hidden_restaurant_id=document.createElement("input");field_hidden_restaurant_id.type="hidden",field_hidden_restaurant_id.name="restaurant_id",field_hidden_restaurant_id.value=restaurant_id,formSendReview.appendChild(field_hidden_restaurant_id),formSendReview.addEventListener("submit",function(event){let error=[];event.preventDefault();const name=document.getElementById("name"),rating=document.getElementById("rating"),comments=document.getElementById("comments");if([name,rating,comments].forEach(function(field){"name"==field.name&&(""==field.value.trim()?(error.push("It is mandatory to insert the NAME!"),field.style.borderColor="#f00"):field.style.borderColor="#ccc"),"rating"==field.name&&(""==field.value.trim()?(error.push("The EVALUATION is mandatory!"),field.style.borderColor="#f00"):field.style.borderColor="#ccc"),"comments"==field.name&&(""==field.value.trim()?(error.push("It is mandatory to insert the comment!"),field.style.borderColor="#f00"):field.style.borderColor="#ccc")}),0==error.length){const id=getParameterByName("id"),body_content=new FormData;body_content.append("name",name.value),body_content.append("rating",Number(rating.value)),body_content.append("comments",comments.value),body_content.append("restaurant_id",Number(id));const DateReview=new Date;console.log(Date.parse(DateReview));const review_data={name:name.value,rating:Number(rating.value),comments:comments.value,restaurant_id:Number(id),createdAt:Date.parse(DateReview),updatedAt:Date.parse(DateReview)},review_offline_data={name:name.value,rating:Number(rating.value),comments:comments.value,restaurant_id:Number(id)};fetch("http://localhost/server-php-mws-restaurant/server.php?add_review_restaurant_id=",{method:"POST","Accept-Charset":"utf-8","Content-Type":"application/x-www-form-urlencoded",body:body_content}).then(function(response){if(response.ok)return response.json();return"Data not loaded"}).then(function(data){console.log(data);DBHelper.openAdviseUser("Review added thanks","reload")}).catch(function(){console.log("Network error"),DBHelper.putOfflineValuesReviewDatabase(review_data,review_offline_data)})}});