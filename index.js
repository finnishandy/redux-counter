import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
//import IRC from './custom/irc'


//https://github.com/SalvationDevelopment/YGOPro-Salvation-Server/blob/master/http/js/irc/irc-ws.js
var webSocket = new WebSocket('ws://163.172.153.75:8080');

const store = configureStore({counter: 3})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

function WebSocketOpen() {
    'use strict';
    console.log("open");
    var nickname = 'paolliliel';
    this.send('NICK ' + nickname + '\r\n');
    this.send('USER ' + nickname + ' * 0 :' + nickname + '\r\n');
}

webSocket.onopen = WebSocketOpen;

webSocket.onerror = function(err) {
 console.log('err', err);
};

webSocket.onmessage = function(msg) {
  let ping = msg.data.indexOf('PING :');
  if (ping !== -1) {
    let pong = 'PONG ' + msg.data.slice(5, msg.length);
    console.log('ping', ping);
    console.log('pong', pong);
    webSocket.send(pong);
  }
  let parsed = ircparse(msg.data);
  store.dispatch({ type: parsed.command, data: parsed });
}

webSocket.onclose = function() {
 console.log('close');
}

var ircparse = function (text) {
    //https://raw.githubusercontent.com/braddunbar/irc-parser/master/index.js
    'use strict';
    var raw = text,
        i,
        prefix,
        command,
        params = [];

    // prefix
    if (text.charAt(0) === ':') {
        i = text.indexOf(' ');
        prefix = text.slice(1, i);
        text = text.slice(i + 1);
    }

    // command
    i = text.indexOf(' ');
    if (i === -1) {
        i = text.length;
    }
    command = text.slice(0, i);
    text = text.slice(i + 1);

    // middle
    while (text && text.charAt(0) !== ':') {
        i = text.indexOf(' ');
        if (i === -1) {
            i = text.length;
        }
        params.push(text.slice(0, i));
        text = text.slice(i + 1);
    }

    // trailing
    if (text) {
        params.push(text.slice(1));
    }
    return {
        raw: raw,
        prefix: prefix,
        command: command,
        params: params
    };
};
