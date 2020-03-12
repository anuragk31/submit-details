
(function() {
  let clientAdd, latitude, longitude;
  window.addEventListener('load', function() {

    var forms = document.getElementsByClassName('needs-validation');
    var cityDropDown = document.querySelector('#city');
    var areaDropDown = document.querySelector('#area');
    var pinSelector = document.querySelector('#phone2');
    var pinvaluesStr = `11865 11957 11762 11780 11642 11902 11742 11542 11273 11630 11211 11126 11976 11989 11711 11601 11658 11643 11722 11955 11422 11212 11218 11745 11965 11549 11433 11466 11320 11676 11548 11430 11609 11004 11354 11546 11759 11650 11540 11387 11382 11374 11445 11375 11346 11654 11345 11783 11447 11659 11234 11324 11653 41324 41765 41956 41378 41651 41891 41486 41552 41090 41989 41299 11744 21124 21465 21238 21915 21630 21887 21077 21416 21396 21612 21305 21815 21742 21736 21405 21868 21865 21426 21839 21050 21928 21810 21068 21284 21272 21812 21637 21452 21803 21427 21753 21447 21337 21616 21900 21494 21688 21440 21113 21769 21716 21390 21659 21849 21641 21905 21058 21394 21434 21913 21570 21547 21208 21346 21483 21943 21155 21819 21886 21694 21978 21349 21201 21876 21482 21750 21997 21354 21475 21361 21663 21060 21243 21756 21521 21399 21824 21825 21861 21432 21631 21896 21338 21623 21257 41345 41768 41546 41480 41657 41740 41103 41305 41046 41479 41380 41474 41267 41732 41342 41282 41294 41384 41308 41839 41930 41939 41628 41830 42848 41328 41832`;
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
