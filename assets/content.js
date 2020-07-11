chrome.runtime.sendMessage({todo: "showPageAction"});

let isSuccess = ($('.notice-success').length > 0);
let isFailure = ($('.notice-danger').length > 0);
let input = $('#sample1');
let form = $('#submit');

let states = {
  isActive: null,
  current:  null,
  baseline: null,
  profit: null
};

chrome.storage.sync.get("profit", state => {
  states.profit = state.profit || 0;
  chrome.storage.sync.get("isActive", state => {
    states.isActive = state.isActive === 'true' ? 1 : 0;
    chrome.storage.sync.get("baseline", bet => {
      states.baseline = bet.baseline || 1;
      chrome.storage.sync.get("current", bet => {
        states.current = parseInt(bet.current) || parseInt(states.baseline);
        if (isFailure) {
          states.profit -= states.current;
          states.current = bet.current*2;
        } else if (isSuccess) {
          states.profit += states.current;
          states.current = states.baseline;
        } else {
          states.profit = 0;
        }
        chrome.storage.sync.set({current: states.current});
        chrome.storage.sync.set({profit: states.profit});

        function timeout() {
          setTimeout(() => {
            input.val(states.current);

            setTimeout(() => {
              form.submit();
            },250)
          }, Math.floor(Math.random()*1000)+1250)
        }

        let header = $('.kt-subheader__title');
        let newHeader = ` | Gambler: [ ${states.isActive} | ${states.baseline} | ${states.current} ]`;
        header.append(newHeader);

        let profitDisplay = $('<span></span>');
        if (states.profit > 0) {
          profitDisplay.text(`+${states.profit}`);
          profitDisplay.css({"color": "green"})
        } else if (states.profit < 0) {
          profitDisplay.text(`${states.profit}`);
          profitDisplay.css({"color": "red"})
        } else {
          profitDisplay.text(states.profit);
        }
        profitDisplay.css({"margin-left": '1rem'});
        header.append(profitDisplay);

          let initButton = $('<button></button>')
          .text(states.isActive ? 'Stop' : 'Begin')
          .css({"margin-left": '1rem', "border-radius": "1rem"})
          .click(() => {
            if (states.isActive) {
              chrome.storage.sync.set({isActive: 'false'})
            } else {
              chrome.storage.sync.set({isActive: 'true'});
              timeout()
            }
          });
        header.append(initButton);

        if (states.isActive) {
          timeout();
        }
      });
    });
  });
});
