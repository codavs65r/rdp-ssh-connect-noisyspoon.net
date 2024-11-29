import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window._settings = this.getSettings('org.gnome.shell.extensions.rd-ssh-connect');
  }
}