
(function() {
  let clientAdd, latitude, longitude;
  window.addEventListener('load', function() {

    var forms = document.getElementsByClassName('needs-validation');
    var cityDropDown = document.querySelector('#city');
    var areaDropDown = document.querySelector('#area');
    var pinSelector = document.querySelector('#phone2');
    var pinvaluesStr = `11957 11762 11780 11642 11902 11742 11542 11273 11630 11211 11126 11976 11989 11711 11601 11658 11643 11722 11955 11422 11212 11218 11745 11965 11549 11433 11466 11320 11676 11548 11430 11609 11004 41324 41765 41956 41378 41651 41891 41486 41552 41090 41989 41299 11744 21486 21709 21341 21751 21882 21028 21541 21678 21452 21918 21942 21898  21976 21628 21293 21000 21223 21510 21084 21208 21695 21937 21018 21226 21329 21429 21263 21842 21764 21592 21349 21127 21548 21956 21201 21353 21649 21378 21352 21989 21821 21987 21020 21024 21038 21982 21954 21711 21198 21232 21693 21907 21542 21760 21856`;
    var pinValueArr = pinvaluesStr.split(" ");


    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        var pnValue = pinSelector.value.trim();
        if((pnValue.length == 0) || pinValueArr.indexOf(pnValue) == -1){
          pinSelector.setCustomValidity("invalid");
        }else{
          pinSelector.setCustomValidity("");
        }
        if (form.checkValidity() === false) {
          form.classList.add('was-validated');
        } else {
          try {
            let requestBody = {};
            let formData = new FormData(form);
            let it = formData.keys();
            let result = it.next();
            while (!result.done) {
              requestBody[result.value] = formData.get(result.value);
              result = it.next();
            }
            requestBody["address"] = clientAdd;
            requestBody["latitude"] = latitude;
            requestBody["longitude"] = longitude;
            const data = await postData(requestBody);
            if(data.status == "success") {
              let scsMsg = document.querySelector(".successMsg");
              scsMsg.classList.remove("hidden");
              setTimeout(()=>{
                scsMsg.classList.add("hidden");
              }, 5000);
              form.reset();
            }else if(data.status == "fail"){
              let dupMsg = document.querySelector(".duplicateError");
              dupMsg.classList.remove("hidden");
              setTimeout(()=>{
                dupMsg.classList.add("hidden");
              }, 8000);
            }
          } catch (error) {
            console.error(error);
          }
          form.classList.remove('was-validated');
        }
      }, false);
    });

    cityDropDown.addEventListener("change", function(event){
      let value = event.target.value;
      areaDropDown.removeAttribute("list");
      areaDropDown.setAttribute("list", value);
    }, false)
  }, false);

  navigator.geolocation.getCurrentPosition(success, error);
  function success(position) {
      var GEOCODING = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + '%2C' + position.coords.longitude  + `&key=AIzaSyAN44ZFYwJCgBjhirAxOV_5S3_s5B9UANw`;
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      getData(GEOCODING).then(function(response) {
        let results = response.results;
          let address = results.find(add=>{
            return (add.types && add.types.length && [add.types] == "route");
          });
          clientAdd = address && address.formatted_address;
      });
  }
  function error(err) {
      console.log(err)
  }


  async function getData(url) {
    const response = await fetch(url, {
      method: 'GET'
    });
    return await response.json();
  }

  async function postData(data = {}) {
    const url = '/api/save';
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify(data)
    });
    return await response.json();
  }
})();
