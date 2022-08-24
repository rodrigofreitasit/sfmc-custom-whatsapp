'use strict';
(require) => {
  var Postmonger = require('postmonger');
  var connection = new Postmonger.Session();

  var authTokens = {};
  var payload = {};
  var schema = {};
  var dataPayload = [];
  var steps = [
    // initialize to the same value as what's set in config.json for consistency
    {
      label: "Step 1",
      key: "step1"
    },
    {
      label: "Step 2",
      key: "step2"
    },
  ];
  var currentStep = steps[0].key;
  var hasNameCampaign = null;

  $(window).ready(onRender);
  connection.on('requestedTokens', onGetTokens);
  connection.on("initActivity", initActivity);
  connection.on("requestedSchema", requestedSchema);
  connection.on("clickedNext", onClickedNext);
  connection.on("clickedBack", onClickedBack);
  connection.on("gotoStep", onGotoStep);


  /* ![ Form Validate ] ================================================================== */

  function onRender() {
    connection.trigger("ready");
    connection.trigger("nextStep");
    connection.trigger("prevStep");
    connection.trigger('requestTokens');

    // Disable the next button if a value isn't selected
    $("#nameCampaign").change(function () {
      hasNameCampaign = getMessage();
      hasNameCampaign = hasNameCampaign.nameCampaign;
      connection.trigger("updateButton", {
        button: "next",
        text: "next",
        enabled: Boolean(hasNameCampaign),
      });
    });
  }

  function initActivity(data) {
    if (data) {
      payload = data;
    }

    var hasInArguments = Boolean(
      payload["arguments"] &&
      payload["arguments"].execute &&
      payload["arguments"].execute.inArguments &&
      payload["arguments"].execute.inArguments.length > 0
    );

    var inArguments = hasInArguments ?
      payload["arguments"].execute.inArguments : {};

    $.each(inArguments, function (index, inArgument) {
      $.each(inArgument, function (key, val) {
        if (key === "nameCampaign") {
          hasNameCampaign = val;
        }
      });
    });

    // If there is no message selected, disable the next button
    if (!hasNameCampaign) {
      showStep(null, 1);
      connection.trigger("updateButton", {
        button: "next",
        enabled: false
      });
      // If there is a message, skip to the summary step
    } else {
      $("#nameCampaign").attr("value");
      showStep(null, 2);
    }

    connection.trigger("requestSchema");
    if (inArguments) {
      setTimeout(function () {
        fillForm(inArguments);
      }, 1500);
    }
  }

  //function to copy to clipboard
  function copyToClipboard(text) {
    var sampleTextarea = document.createElement("textarea");
    document.body.appendChild(sampleTextarea);
    sampleTextarea.value = text; //save main text in it
    sampleTextarea.select(); //select textarea contenrs
    document.execCommand("copy");
    document.body.removeChild(sampleTextarea);
  }

  function textToCopy(data) {
    var copyText = `<<${data.textContent}>>`;
    copyToClipboard(copyText);
    // Ao clicar na variavel, copia o texto para onde esta o cursor 
    // var txtarea = document.getElementById("message");
    // var start = txtarea.selectionStart;
    // var end = txtarea.selectionEnd;
    // var sel = txtarea.value.substring(start, end);
    // var finText =
    //   txtarea.value.substring(0, start) +
    //   copyText +
    //   sel +
    //   txtarea.value.substring(end);
    // txtarea.value = finText;
    // txtarea.focus();
    // txtarea.selectionEnd = end + copyText.length;
  }

  // request fields from Data Extension
  function requestedSchema(data) {
    if (data.error) {
      console.error("requestedSchema Error: ", data.error);
    } else {
      schema = data["schema"];
    }
    var ul = document.getElementById("ul-variable");
    var spinner = document.getElementById("spinner");
    setTimeout(function () {
      ul.removeChild(spinner);
      for (const i in schema) {
        var li = document.createElement("li");
        var div = document.createElement("div");
        var h6 = document.createElement("h6");
        var text = document.createTextNode(schema[i].name);
        li.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "lh-sm"
        );
        h6.classList.add("my-0");
        h6.setAttribute("id", schema[i].name);
        h6.setAttribute("onclick", "textToCopy(this)");
        h6.style.cursor = "pointer";
        h6.appendChild(text);
        div.appendChild(h6);
        li.appendChild(div);
        ul.appendChild(li);
      }
    }, 3000);
  }

  function onClickedNext() {
    if (currentStep.key === "step2") {
      save();
    } else {
      connection.trigger("nextStep");
    }
  }


  function onClickedBack() {
    connection.trigger("prevStep");
  }

  function onGotoStep(step) {
    showStep(step);
    connection.trigger("ready");
  }


  function showStep(step, stepIndex) {
    if (stepIndex && !step) {
      step = steps[stepIndex - 1];
    }

    currentStep = step;

    $(".step").hide();

    switch (currentStep.key) {
      case "step1":
        $("#step1").show();
        connection.trigger("updateButton", {
          button: "next",
          text: "next",
          enabled: Boolean(hasNameCampaign),
        });
        connection.trigger("updateButton", {
          button: "back",
          visible: false,
        });
        break;
      case "step2":
        $("#step2").show();
        connection.trigger("updateButton", {
          button: "back",
          visible: true,
        });
        connection.trigger("updateButton", {
          button: "next",
          text: "done",
          visible: true,
        });
        break;
    }
  }


  function onGetTokens(data) {
    console.log('tokens: ' + JSON.stringify(data));
    return authTokens = data;
  }

  // function onGetEndpoints(endpoints) {
  //     // console.log(endpoints);
  // }

  function save() {
    var bodyMessage = getMessage();
    var messageTreated = treatMessage(bodyMessage);
    bodyMessage = messageTreated;
    payload["arguments"].execute.inArguments = [bodyMessage];

    payload["metaData"].isConfigured = true;

    connection.trigger("updateActivity", payload);
  }


  function getMessage() {
    var obj = [];
    var inputs = document.querySelectorAll("input,textarea,select");
    var arr = Array.from(inputs);
    for (var i in arr) {
      let id = arr[i].id;
      let value = arr[i].value;
      obj.push({
        id: id,
        value: value
      });
    }
    let data = obj.reduce((acc, cur) => ({
      ...acc,
      [cur.id]: cur.value
    }), {});
    return data;
  }


  function treatMessage(msg) {
    var messageToTreat = msg;
    if (messageToTreat) {
      for (var k in messageToTreat) {
        for (const i in schema) {
          let keyDE = schema[i].key;
          let nameDE = schema[i].name;
          let varName = `<<${nameDE}>>`;
          messageToTreat[k] = messageToTreat[k].replace(varName, `{{${keyDE}}}`);
          console.log(messageToTreat[k])
        }
      }
      return messageToTreat;
    }
  }

  function fillForm(inArguments) {
    dataPayload = inArguments[0];
    if (dataPayload) {
      for (const i in dataPayload) {
        var property = dataPayload[i];
        if (
          property.indexOf("Event.DEAudience") >= 0 ||
          property.indexOf("Event.APIEvent") >= 0
        ) {
          for (var index in schema) {
            var keyDE = schema[index].key;
            var nameDE = schema[index].name;
            var varName = `<<${nameDE}>>`;
            dataPayload[i] = dataPayload[i]
              .replace(keyDE, varName)
              .replace(/\{{(.+?)\}}/gi, `$1`);
          }
        }
      }
      var nameCampaign = document.getElementById("nameCampaign");
      nameCampaign.value = dataPayload.nameCampaign;

      var nameProduct = document.getElementById("nameProduct");
      nameProduct.value = dataPayload.nameProduct;

      var firstName = document.getElementById("firstName");
      firstName.value = dataPayload.firstName;
      var lastName = document.getElementById("lastName");
      lastName.value = dataPayload.lastName;
      var username = document.getElementById("username");
      username.value = dataPayload.username;
      var email = document.getElementById("email");
      email.value = dataPayload.email;
      var address = document.getElementById("address");
      address.value = dataPayload.address;
      var message = document.getElementById("message");
      message.value = dataPayload.message;
      var country = document.getElementById("country");
      country.value = dataPayload.country;
      var state = document.getElementById("state");
      state.value = dataPayload.state;
      var zip = document.getElementById("zip");
      zip.value = dataPayload.zip;
    }
  }
  module.onGetTokens = onGetTokens;
}