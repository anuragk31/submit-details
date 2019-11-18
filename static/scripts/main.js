(function() {
  let clientAdd, latitude, longitude;
  window.addEventListener('load', function() {


    var forms = document.getElementsByClassName('needs-validation');

    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();
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
