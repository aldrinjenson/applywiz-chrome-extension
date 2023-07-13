/* eslint-disable no-case-declarations */
import firebase from '../services/fbConfig';
import { toastNotify } from '../common/common_utils';
import { initializeStorageWithDefaults } from '../storage';
import { Message } from '../types';
import {
  addJobsToDb,
  handleEmailSignin,
  handleSignOut,
} from '../services/firebseUtils';

import store from './store';

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorageWithDefaults({});
  console.log('Extension successfully installed!');
  const jobs = [
    {
      jobName: 'Dot Net Developer(TL) - API Team',
      jobUrl:
        'https://www.linkedin.com/jobs/view/3659374578/?eBP=JOB_SEARCH_ORGANIC&refId=qkdFpIS07KSv0TOek8N0KQ%3D%3D&trackingId=Al3knqP7Jb4hvmi18UzVRw%3D%3D&trk=flagship3_search_srp_jobs',
      companyName: 'In4Velocity Systems',
      companyImg:
        'https://media.licdn.com/dms/image/C4D0BAQFVNuQGEIkeJg/company-logo_100_100/0/1625113773806?e=1697068800&v=beta&t=QSScAE27FMUe7TufkONpFTLmF_hS-yZP2Z8bow2X2AA',
      companyLocation: 'Bengaluru, Karnataka, India (On-site)',
      status: 'success',
      userId: '5AADfhgj6OhMvgZoqEBPdJoNiER2',
      createdAt: 1689263084342,
    },
    {
      jobName: 'Vehicle Interface Software Developer',
      jobUrl:
        'https://www.linkedin.com/jobs/view/3662012344/?eBP=JOB_SEARCH_ORGANIC&refId=qkdFpIS07KSv0TOek8N0KQ%3D%3D&trackingId=sXFmx%2BKrCn%2B59%2FHuHZFK1w%3D%3D&trk=flagship3_search_srp_jobs',
      companyName: 'Apidel Technologies',
      companyImg:
        'https://media.licdn.com/dms/image/C4D0BAQFq0dUVK8AgYA/company-logo_100_100/0/1656647085521?e=1697068800&v=beta&t=GD8tY5CjB9vhBRcP10jwaelLZiKFl36O51-UkRLX6Iw',
      companyLocation: 'Bengaluru, Karnataka, India (On-site)',
      status: 'success',
      userId: '5AADfhgj6OhMvgZoqEBPdJoNiER2',
      createdAt: 1689263084342,
    },
  ];
  addJobsToDb(jobs, '5AADfhgj6OhMvgZoqEBPdJoNiER2');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.table(value);
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
    );
  }
});

chrome.runtime.onMessage.addListener(
  async (message: Message, sender, sendReponse) => {
    const { action, data } = message;

    switch (action) {
      case 'SHOW_NOTIFICATION':
        toastNotify(data?.text);
        break;
      case 'GET_COUNTER':
        const state = store.getState();
        sendReponse(state);
        break;
      case 'GET_USER':
        const savedUser = store.getState().user;
        if (!savedUser) console.log('user not present bro!');
        sendReponse(savedUser);
        break;

      case 'ADD_JOBS_TO_DB':
        const firebaseUser = store.getState().user;
        console.log('data');

        console.log(data);

        const jobs = data;
        addJobsToDb(jobs, firebaseUser.uid);
        break;

      case 'USER_SIGN_IN':
        const { email, password } = data;
        toastNotify('Logging in.', 'Hold on..');
        handleEmailSignin(email, password).then((user) => {
          console.log({ user });
          store.dispatch('SET_USER', user);
          chrome.runtime.sendMessage({ action: 'SIGN_IN_SUCCESS', data: user });
          toastNotify('Successfully logged in');
        });
        break;

      case 'USER_SIGN_OUT':
        handleSignOut()
          .then(() => {
            store.dispatch('SET_USER', null);
            chrome.runtime.sendMessage({
              action: 'SIGN_OUT_SUCCESS',
              user: null,
            });
            toastNotify('Successfully signed out');
          })
          .catch(() => {
            toastNotify('Error in signing out.', 'Please try again later');
          });
        break;

      default:
        console.log(' Warning: Unhandled action:', action);
    }

    return true;
  },
);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    store.dispatch('SET_USER', user);
  } else {
    store.dispatch('SET_USER', null);
    chrome.runtime.sendMessage({ action: 'SIGN_OUT_SUCCESS', user });
  }
});
