import {
  addStyles,
  createPopup,
  getCurrentDialog,
  getCurrentPage,
  getSetting,
  hasMiniCRE,
  isAppleOS,
  onNavigation,
  saveSetting
} from '@utils';

import {
  clickMinLuck,
  disarmCharm,
  disarmCheese,
  gotoPage,
  openBlueprint,
  openGifts,
  openInbox,
  openMap,
  openMapInvites,
  openMarketplace,
  showTem
} from './actions';

import styles from './styles.css';

const getBaseShortcuts = () => {
  const shortcuts = [
    {
      id: 'help',
      key: '?',
      shiftKey: true,
      description: 'Help',
      action: showHelpPopup,
      type: 'hidden',
    },
    {
      id: 'goto-travel',
      key: 't',
      description: 'Go to Travel',
      action: () => gotoPage('Travel'),
    },
    {
      id: 'goto-camp',
      key: 'j',
      description: 'Go to Camp',
      action: () => gotoPage('Camp'),
    },
    {
      id: 'goto-friends',
      key: 'f',
      description: 'Go to Friends',
      action: () => gotoPage('Friends'),
    },
    {
      id: 'goto-shops',
      key: 's',
      description: 'Go to Shops',
      action: () => gotoPage('Shops'),
    },
    {
      id: 'goto-profile',
      key: 'p',
      description: 'Go to your Profile',
      action: () => gotoPage('HunterProfile'),
    },
    {
      id: 'goto-send-supplies',
      description: 'Go to Send Supplies',
      action: () => gotoPage('SupplyTransfer'),
    },
    {
      id: 'goto-scoreboards',
      description: 'Go to Scoreboards',
      action: () => gotoPage('Scoreboards'),
    },
    {
      id: 'goto-team',
      description: 'Go to Team',
      action: () => gotoPage('Team'),
    },
    {
      id: 'goto-tournaments',
      description: 'Go to Tournaments',
      action: () => gotoPage('Tournament'),
    },
    {
      id: 'goto-marketplace',
      description: 'Open the Marketplace',
      action: openMarketplace,
    },
    {
      id: 'open-inbox',
      description: 'Open the Inbox',
      action: openInbox,
    },
    {
      id: 'open-gifts',
      description: 'Open the Gifts popup',
      action: openGifts,
    },
    {
      id: 'open-map',
      key: 'm',
      description: 'Open Map',
      action: openMap,
    },
    {
      id: 'open-map-invites',
      key: 'i',
      description: 'Open Map Invites',
      action: openMapInvites,
    },
    {
      id: 'change-weapon',
      key: 'w',
      description: 'Change Weapon',
      action: () => openBlueprint('weapon'),
    },
    {
      id: 'change-base',
      key: 'b',
      description: 'Change Base',
      action: () => openBlueprint('base'),
    },
    {
      id: 'change-charm',
      key: 'r',
      description: 'Change Charm',
      action: () => openBlueprint('trinket'),
    },
    {
      id: 'change-cheese',
      key: 'c',
      description: 'Change Cheese',
      action: () => openBlueprint('bait'),
    },
    {
      id: 'change-skin',
      description: 'Change Trap Skin',
      action: () => openBlueprint('skin'),
    },
    {
      id: 'show-tem',
      key: 'e',
      description: 'Show the <abbr title="Trap Effectiveness Meter">TEM</abbr>',
      action: showTem,
    },
    {
      id: 'disarm-cheese',
      description: 'Disarm your Cheese',
      action: disarmCheese,
    },
    {
      id: 'disarm-charm',
      description: 'Disarm your Charm',
      action: disarmCharm,
    },
  ];

  if (hasMiniCRE()) {
    shortcuts.push({
      id: 'show-mini-cre',
      key: 'l',
      description: 'Open Mini CRE',
      action: clickMinLuck,
    });
  }

  return shortcuts;
};

const getShortcuts = () => {
  const shortcuts = getBaseShortcuts();

  const saved = getSetting('keyboard-shortcuts', false);
  if (! saved) {
    return shortcuts;
  }

  // Merge the saved shortcuts with the defaults.
  saved.forEach((savedShortcut) => {
    const shortcut = shortcuts.find((s) => s.id === savedShortcut.id);
    if (! shortcut) {
      return;
    }

    shortcut.key = savedShortcut.key;
    shortcut.metaKey = savedShortcut.metaKey;
    shortcut.altKey = savedShortcut.altKey;
    shortcut.shiftKey = savedShortcut.shiftKey;
  });

  return shortcuts;
};

const saveShortcut = (shortcutId, shortcutKey) => {
  let saved = getSetting('keyboard-shortcuts', false);

  if (! saved) {
    saved = [];
  }

  const toSave = {
    id: shortcutId,
    key: shortcutKey.key,
    metaKey: shortcutKey.metaKey,
    altKey: shortcutKey.altKey,
    shiftKey: shortcutKey.shiftKey,
  };

  // if the shortcut already exists, then remove it.
  const existingShortcut = saved.find((s) => s.id === shortcutId);
  if (existingShortcut) {
    saved = saved.filter((s) => s.id !== shortcutId);
  }

  // only save the shortcut if it's not the default, its not blank, delete, or backspace, and it's not already in use.
  if (
    toSave.key &&
    toSave.key !== 'Backspace' &&
    toSave.key !== 'Delete' &&
    toSave.key !== ' '
  ) {
    saved.push(toSave);
  }

  saveSetting('keyboard-shortcuts', saved);

  const savedElement = document.querySelector(`.mh-ui-keyboard-shortcut[data-shortcut-id="${shortcutId}"]`);
  if (savedElement) {
    savedElement.classList.add('saved');
    setTimeout(() => {
      savedElement.classList.remove('saved');
    }, 300);
  }
};

const getKeyForDisplay = (keyEvent) => {
  let keyString = '';

  const keysToShow = [];
  // Show the modifier keys first.
  if (keyEvent.metaKey) {
    keysToShow.push(isAppleOS() ? '⌘' : '⊞');
  }

  if (keyEvent.ctrlKey) {
    keysToShow.push(isAppleOS() ? '⌃' : 'Ctrl');
  }

  if (keyEvent.altKey) {
    keysToShow.push(isAppleOS() ? '⌥' : 'Alt');
  }

  if (keyEvent.shiftKey) {
    keysToShow.push('Shift');
  }

  switch (keyEvent.key) {
  case ' ':
    keysToShow.push('Space');
    break;
  case 'ArrowUp':
    keysToShow.push('↑');
    break;
  case 'ArrowDown':
    keysToShow.push('↓');
    break;
  case 'ArrowLeft':
    keysToShow.push('←');
    break;
  case 'ArrowRight':
    keysToShow.push('→');
    break;
  case 'Backspace':
    // if it's backspace, we want to clear the shortcut.
    keysToShow.push('');
    break;
  default:
    // if its a plain letter, then capitalize it.
    if (keyEvent.key && keyEvent.key.length === 1) {
      keysToShow.push(keyEvent.key.toUpperCase());
    } else {
      keysToShow.push(keyEvent.key);
    }

    break;
  }

  keyString = keysToShow.join('<span class="connector"> + </span>');

  return keyString;
};

const isHelpPopupOpen = () => {
  const overlay = getCurrentDialog();
  if (! overlay) {
    return false;
  }

  return 'mh-ui-keyboard-shortcuts-popup' === overlay;
};

const showHelpPopup = () => {
  if (activejsDialog && activejsDialog.hide) {
    // If the popup is already open, close it.
    if (isHelpPopupOpen()) {
      activejsDialog.hide();
      return;
    }

    // Otherwise, close any other popup that might be open and open the help popup.
    activejsDialog.hide();
  }

  const shortcuts = getShortcuts();
  let innerContent = '';
  shortcuts.forEach((shortcut) => {
    if ('hidden' === shortcut.type) {
      return;
    }

    innerContent += `<div class="mh-ui-keyboard-shortcut" data-shortcut-id="${shortcut.id}">
    <div class="description">${shortcut.description}</div>
    <div class="edit-controls">
      <a class="clear">Clear</a>
      <a class="reset">Reset</a>
      <a class="edit">Edit</a>
    </div>
    <kbd>${getKeyForDisplay(shortcut)}</kbd>
    </div>`;
  });

  const content = `<div class="mh-ui-keyboard-shortcuts-popup-content">
    <h2 class="mh-ui-keyboard-shortcuts-edit-content">
      To edit a shortcut, click on <em>Edit</em> on the shortcut, then press the key combination you want to use.
    </h2>
    <div class="mh-ui-keyboard-shortcuts-popup-content-list">
      ${innerContent}
    </div>
  </div>`;

  createPopup({
    title: 'MouseHunt Improved Keyboard Shortcuts',
    content,
    hasCloseButton: true,
    show: true,
    className: 'mh-ui-keyboard-shortcuts-popup'
  });

  const shortcutsWrapper = document.querySelector('.mh-ui-keyboard-shortcuts-popup-content');
  const shortcutButtons = document.querySelectorAll('.mh-ui-keyboard-shortcuts-popup-content-list .mh-ui-keyboard-shortcut');
  shortcutButtons.forEach((shortcut) => {
    const shortcutId = shortcut.getAttribute('data-shortcut-id');
    const editButton = shortcut.querySelector('.edit');
    const resetButton = shortcut.querySelector('.reset');
    const clearButton = shortcut.querySelector('.clear');

    const kbd = shortcut.querySelector('kbd');

    const startEditing = () => {
      isEditing = true;
      editButton.innerText = 'Cancel';
      shortcut.classList.add('editing');
      shortcutsWrapper.classList.add('editing');
      document.addEventListener('keydown', keypressListener);
    };

    const finishEditing = (id = false, key = false) => {
      isEditing = false;
      editButton.innerText = 'Edit';
      shortcut.classList.remove('editing');
      shortcutsWrapper.classList.remove('editing');
      document.removeEventListener('keydown', keypressListener);

      if (! id || ! key) {
        return;
      }

      saveShortcut(id, key);
      kbd.innerHTML = getKeyForDisplay(key);
    };

    const keypressListener = (event) => {
      // if the key is alt, shift, ctrl, or meta, by itself, don't do anything, because that's not a valid shortcut by itself.
      // if the key matches the key of another shortcut, show an error message for a second.
      // otherwise, save the shortcut and update the display and remove the event listener.
      if (['Alt', 'Shift', 'Control', 'Meta'].includes(event.key)) {
        return;
      }

      const theShortcut = getShortcuts().find((s) => {
        return (
          s.key === event.key &&
          s.metaKey === event.metaKey &&
          s.altKey === event.altKey &&
          s.shiftKey === event.shiftKey
        );
      });

      if (theShortcut) {
        // find the shortcut that matches the key and show an error message.
        const matchingShortcut = document.querySelector(`.mh-ui-keyboard-shortcut[data-shortcut-id="${theShortcut.id}"]`);
        if (! matchingShortcut) {
          return;
        }

        // if the shortcut is already the one we're editing, then just finish editing.
        if (shortcutId === theShortcut.id) {
          finishEditing(shortcutId, event);
          return;
        }

        matchingShortcut.classList.add('error');
        shortcut.classList.add('error');

        setTimeout(() => {
          matchingShortcut.classList.remove('error');
          shortcut.classList.remove('error');
        }, 300);

        return;
      }

      finishEditing(shortcutId, event);
    };

    editButton.addEventListener('click', () => {
      if (isEditing) {
        finishEditing();
      } else {
        startEditing();
      }
    });

    resetButton.addEventListener('click', () => {
      const defaultShortcut = getBaseShortcuts().find((s) => s.id === shortcutId);
      if (! defaultShortcut) {
        return;
      }

      finishEditing(shortcutId, defaultShortcut);
    });

    clearButton.addEventListener('click', () => {
      finishEditing(shortcutId, {
        key: '',
        metaKey: false,
        altKey: false,
        shiftKey: false,
      });
    });
  });
};

let isEditing = false;
const listenForKeypresses = () => {
  // If the help popup is closed, then listen for keypresses, unless it's inside an input or textarea or something like that. When a key is pressed, check if it's one of the shortcuts and if so, run the action.
  document.addEventListener('keydown', (event) => {
    if (isHelpPopupOpen() || isEditing) {
      return;
    }

    const tagName = event.target.tagName.toLowerCase();
    if (
      'input' === tagName ||
      'textarea' === tagName ||
      'select' === tagName
    ) {
      return;
    }

    const shortcuts = getShortcuts();
    const shortcut = shortcuts.find((s) => {
      s.metaKey = s.metaKey || false;
      s.altKey = s.altKey || false;
      s.shiftKey = s.shiftKey || false;

      return (
        s.key === event.key &&
        s.metaKey === event.metaKey &&
        s.altKey === event.altKey &&
        s.shiftKey === event.shiftKey
      );
    });

    if (shortcut && shortcut.action) {
      event.preventDefault();
      event.stopPropagation();

      shortcut.action();
    }
  });
};

const openFromSettings = () => {
  if ('preferences' !== getCurrentPage()) {
    return;
  }

  const openLink = document.querySelector('.mh-ui-keyboard-shortcuts-edit');
  if (! openLink) {
    return;
  }

  openLink.addEventListener('click', (event) => {
    event.preventDefault();
    showHelpPopup();
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  listenForKeypresses();

  onNavigation(hasMiniCRE, {
    page: 'camp'
  });

  onNavigation(openFromSettings, {
    page: 'preferences',
    tab: 'mousehunt-improved-settings'
  });
};

export default {
  id: 'keyboard-shortcuts',
  name: 'Keyboard Shortcuts',
  type: 'feature',
  default: true,
  description: 'Press \'?\' to see and edit the keyboard shortcuts. You can also <a href="#" class="mh-ui-keyboard-shortcuts-edit">edit them here</a>.',
  load: init,
};
