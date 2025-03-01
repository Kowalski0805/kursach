const MTProto = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');
// const prompt = require('prompt');
const { watch } = require('node:fs/promises');
const { readFileSync } = require('fs');
const path = require('path');

const { getEnv } = require('../../config/config');
const { tgSources } = require('../../sources.json');

const {
  apiId,
  apiHash,
  phoneNumber,
  password,
  defaultDcId,
} = getEnv('tg');

/*/ SIM 1
const api_id = '6019300';
const api_hash = 'cf61787dee32ea17ec86d1b1edea6858';
//*/
// SIM 2
// const api_id = '6214343';
// const api_hash = '5fe1a847a30f88e87c143250f899d658';
/*/
// Ben
const api_id = '6263581';
const api_hash = 'f826f7330614dc2b57bfe8a06d629ab9';
//*/
 
// 1. Create an instance
const mtproto = new MTProto({
  api_id: apiId,
  api_hash: apiHash,

  storageOptions: {
    path: path.resolve(__dirname, './data/1.json'),
  },
});

// (async() => { await mtproto.setDefaultDc(4); })()
(async() => { await mtproto.setDefaultDc(defaultDcId); })()
 
const api = {
  call(method, params, options = {}) {
    return mtproto.call(method, params, options).catch(async error => {
      // console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        // console.log({error_message})
        const seconds = +error_message.split('FLOOD_WAIT_')[1];
        const ms = seconds * 1000;

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcId] = error_message.split('_MIGRATE_');

        // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await mtproto.setDefaultDc(+dcId);
        } else {
          options = {
            ...options,
            dcId: +dcId,
          };
        }

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    });
  },
};

async function getUser() {
  try {
    const user = await api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

function sendCode(phone) {
  return api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

function getPassword() {
  return api.call('account.getPassword');
}

function checkPassword({ srp_id, A, M1 }) {
  return api.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  });
}

async function getVerificationCode() {
  let code = '';

  const ac = new AbortController();
  const { signal } = ac;
  const timeoutId = setTimeout(() => ac.abort(), 120_000); // 2 minutes wait time for the user to enter the verification code

  const pathToConfigDir = path.resolve(__dirname, '../../tg-auth');

  try {
    const watcher = watch(pathToConfigDir, { signal });
    for await (const event of watcher) {
      const { eventType, filename } = event;
      if (eventType === 'change' && filename === 'code.txt') {
        code = readFileSync(`${pathToConfigDir}/code.txt`, 'utf-8').toString().trim();
        ac.abort();
        clearTimeout(timeoutId);
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return code;
    }
    throw error;
  }

  return code;
}


// const phone = '+972545849319'; // SIM 1
// const phone = '+79990012963'; // SIM 2
// const phone = '+972547213117' // Ben
// const password = 's1m2m0d3m';

const login = async () => {
  const user = await getUser();
  // console.log(user)

  if (!user) {
    const { phone_code_hash } = await sendCode(phoneNumber);

    // prompt.start();

    // const {code} = await prompt.get(['code']);

    console.log("please, enter verification code in the 'tg-auth/code.txt' file");
    const code = await getVerificationCode();

    try {
      const authResult = await signIn({
        code,
        phone: phoneNumber,
        phone_code_hash,
      });

      // console.log(`authResult:`, authResult);
    } catch (error) {
      if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
        return;
      }

      // 2FA

      const { srp_id, current_algo, srp_B } = await getPassword();
      const { g, p, salt1, salt2 } = current_algo;

      const { A, M1 } = await mtproto.crypto.getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password,
      });

      const authResult = await checkPassword({ srp_id, A, M1 });

      // console.log(`authResult:`, authResult);
    }
  }
};

const getChannelData = ({id, access_hash}) => api.call('messages.getHistory',
  {
    limit: 10, peer: {
      _: 'inputPeerChannel',
      channel_id: id,
      access_hash,
    }
  });

const logOut = () => api.call('auth.logOut', {});

const fetchTgData = async() => {
  // console.log('logout', await logOut());
  // console.log('login', await login());
  await login();
  
  const dialogs = await api.call('messages.getDialogs', {limit: 10, offset_peer: {
    _: 'inputPeerEmpty',
  } });

  const channels = dialogs.chats.filter((dialog) => dialog._ === 'channel' && tgSources.includes(dialog.id));
  // console.log(channels)

  const channelsPromises = channels.flatMap(async (channel) => {
    const channelData = await getChannelData(channel);
    return channelData.messages.map((item) => {
      if (!item.message) return;

      const [title, ...body] = item.message.split('\n\n');

      return {
        title,
        link: `https://t.me/${channel.username ? channel.username : `c/${channel.id}`}/${item.id}`,
        body: body.filter(elem => elem).join('\n'),
        author: item.peer_id.channel_id,
        category: null,
        date: new Date(item.date),
      };
    }).filter(e => e);
  });

  const result = await Promise.all(channelsPromises);
  return result.flatMap(e => e);
};

module.exports = {
  fetchTgData,
};
