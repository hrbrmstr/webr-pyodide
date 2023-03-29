/**
 * @module main
 */

import "./wc/status-message.js"

// we need to render the markdown as quickly as possible
import { renderMarkdownInBody } from "./renderers.js";

await renderMarkdownInBody(
	`main`,
	"ayu-dark",
	[ 'javascript', 'html' ],
	false
)


let message = document.getElementById("status");
message.text = "WebR Loading…"

import * as R from "./r.js";

// LOAD PYTHON!

message.text = "Pyodide Loading…"

import * as Py from "./py.js"

// get some info from python. This `runPython` is kind of nice to work with tbh.
const res = await Py.webPy.runPython(`
import sys
import json
json.dumps({ 'version': sys.version, 'executable': sys.executable, 'platform': sys.platform }, indent=2)
`)

// display stuffs!
const pyOut = document.getElementById("py-output")
pyOut.innerText = res

const rOut = document.getElementById("r-output") 
rOut.innerText = await webR.evalRString("R.version.string")

// I highly suggest opening up DevTools and reloading the page to watch this
message.text = "Installing matplotlib"

await Py.micropip.install(["matplotlib", "numpy"])

// I need to do some penance for this violation of sanity.
const plt = await webPy.runPython(`
import matplotlib.pyplot as plt
import io, base64
import numpy as np

y = [0.22, 0.34, 0.5, 0.56, 0.78]
x = [0.17, 0.5, 0.855]
X, Y = np.meshgrid(x, y)

fig, ax = plt.subplots(figsize=(6, 4), dpi=100)
ax.set(xlim=(0, 1), ylim=(0, 1), xticks=[], yticks=[])
ax.spines[:].set_visible(False)
ax.text(0.5, 0.5, 'plot', fontsize=128, ha='center', va='center', zorder=1)
ax.hlines(y, x[0], x[-1], color='grey')
ax.vlines(x, y[0], y[-1], color='grey')
ax.plot(X.ravel(), Y.ravel(), 'o')
pad_x = 0.02
pad_y = 0.04
ax.text(x[0] - pad_x, y[0], 'bottom', ha='right', va='center')
ax.text(x[0] - pad_x, y[1], 'baseline', ha='right', va='center')
ax.text(x[0] - pad_x, y[2], 'center', ha='right', va='center')
ax.text(x[0] - pad_x, y[3], 'center_baseline', ha='right', va='center')
ax.text(x[0] - pad_x, y[4], 'top', ha='right', va='center')
ax.text(x[0], y[0] - pad_y, 'left', ha='center', va='top')
ax.text(x[1], y[0] - pad_y, 'center', ha='center', va='top')
ax.text(x[2], y[0] - pad_y, 'right', ha='center', va='top')
ax.set_xlabel('horizontalalignment', fontsize=14)
ax.set_ylabel('verticalalignment', fontsize=14, labelpad=35)
ax.set_title('Relative position of text anchor point depending on alignment')

buf = io.BytesIO()
fig.savefig(buf, format='png')
buf.seek(0)
'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')
`)

// we get to put that base64 encoded img right into our placeholder!
const pltOut = document.getElementById("py-plt-output") 
pltOut.src = plt

message.text = "Ready"
