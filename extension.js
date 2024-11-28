/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';

import {Extension, gettext as _, ngettext, pgettext} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const extensionName = 'RDP and SSH Connect';
const panelIconRDP = 'computer-symbolic';
const panelIconSSH = 'utilities-terminal-symbolic';
const path = GLib.get_home_dir() + "/.config/rdp-ssh-connect";
const pathConfig = path + "/config.json";

const hasRDP = !!GLib.find_program_in_path("xfreerdp");
const hasSSH = !!GLib.find_program_in_path("ssh");
const hasConfig = !!GLib.file_test(pathConfig, GLib.FileTest.IS_REGULAR);

function _getConfig(ctxType) {
  if (!hasConfig) {
    return [];
  }
  let jsondata = {};
  const content = String(GLib.file_get_contents(pathConfig)[1]);
  try {
     jsondata = JSON.parse(content);
  } catch (e) {
    logError(e);
  }
  if (ctxType == 'RDP' && jsondata.rdp != undefined)
    return jsondata.rdp.sort((a, b) => a.name.localeCompare(b.name));
  if (ctxType == 'SSH' && jsondata.ssh != undefined)
    return jsondata.ssh.sort((a, b) => a.name.localeCompare(b.name));
  return [];
}

function createMenu(popMenu) {
  if (hasRDP) {
    const RDPHosts = _getConfig('RDP');
    if (RDPHosts.length > 0) {
      const folderRDP = new PopupMenu.PopupSubMenuMenuItem(_('Remote Desktop'), true);
      folderRDP.icon.icon_name = panelIconRDP;
      popMenu.addMenuItem(folderRDP);  

      RDPHosts.forEach((RDPHost) => {          
        folderRDP.menu.addAction(RDPHost.name, () => {
          connectRDP(RDPHost);
        });
      });    
    }
  }  

  if (hasSSH) {
    const SSHHosts = _getConfig('SSH');
    if (SSHHosts.length > 0) {
      const folderSSH = new PopupMenu.PopupSubMenuMenuItem(_('Secure Shell'), true);
      folderSSH.icon.icon_name = panelIconSSH;
      popMenu.addMenuItem(folderSSH);  

      SSHHosts.forEach((SSHHost) => {          
        folderSSH.menu.addAction(SSHHost.name, () => {
          connectSSH(SSHHost);
        });
      });   
    }
  }

  let item = new PopupMenu.PopupImageMenuItem(_('Reload servers'), 'view-refresh-symbolic');
  item.connect("activate", () => {
      popMenu.removeAll();
      createMenu(popMenu);
  });            
  popMenu.addMenuItem(item);
}

function fileListenerHack(popMenu, timeout = 10) {
  GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, timeout, () => {    
    createMenu(popMenu);
    return GLib.SOURCE_CONTINUE
  });
}

async function execCommand(argv) {
    try {
      let proc = new Gio.Subprocess({
        argv: argv,
        flags: Gio.SubprocessFlags.STDOUT_PIPE,
      });
      proc.init(null);
      return new Promise((resolve, reject) => {
        proc.communicate_utf8_async(null, null, (proc, res) => {
          let ok, stdout, stderr;
          try {
            [ok, stdout, stderr] = proc.communicate_utf8_finish(res);
            ok ? resolve(stdout) : reject(stderr);
          } catch (e) {
            reject(e);
          }
        });
      });
    } catch (e) {
      logError(e);
      throw e;
    }
}

async function connectRDP(host) {
    const cmd = ["xfreerdp", "/u:"+host.username, "/p:"+host.password, "/v:"+host.server+":"+host.port, "/bpp:24", "/dynamic-resolution", "/toggle-fullscreen", "/compression", "/cert:tofu"];
    execCommand(cmd);
}

async function connectSSH(host) {
  const cmd = ["gnome-terminal", "--", "ssh", host.server];
  execCommand(cmd);
}

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
  _init() {
    super._init(0.0, _(extensionName));

    const icon = new St.Icon({
      icon_name: 'network-server-symbolic',
      style_class: 'system-status-icon',
    });
    this.add_child(icon);

    createMenu(this.menu);
  }
});

export default class IndicatorExampleExtension extends Extension {
    constructor(metadata) {
        super(metadata);

        this.initTranslations('rdp-ssh-connect@noisyspoon.net');
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
