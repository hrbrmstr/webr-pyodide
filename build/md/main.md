---
{
  "title": "WebR & Pyodide",
  "og" : {
    "site_name": "WebR Exeriments",
    "url": "https://rud.is/w/webr-drop",
    "description": "The Recees Peanut Butter Cup Of The Data Web",
    "image": {
      "url": "https://rud.is/w/webr-drop/img/preview.png",
      "height": "768",
      "width": "1536",
      "alt": "example"
    }
  },
  "twitter": {
    "site": "@hrbrmstr",
    "domain": "rud.is"
  }
}
---

# 🧪 WebR & Pyodide

<status-message id="status"></status-message>

## Hello From Python!

<pre id="py-output">
</pre>

## Hello From R!

<pre id="r-output">
</pre>

## Yes, I'm Making You Look At a Python Plot _(wait for it…)_

<img style='margin-bottom:2rem;' id="py-plt-output"/>

## wut?

A hearty 👋🏼 to all you out there in WebR land!

While I have some other stuff cooking up, you've likely noticed that — even with the [previous experiment](https://rud.is/w/webr-file) — there are still LOTS of R packages that just will not work in WebR _yet_!. Please kick the tyres on this [Observable notebook](https://observablehq.com/@hrbrmstr/fiddling-with-r-universe-webr) which can help you figure out if it's worth the trouble using the R Universe install "hack" or just wait for the builds to happen. Things are progressing super fast in WebR land!

Still, our fav pkgs likely are not ready for prime time. Sure, we have SCADS of JS libraries to use, but we're DATA SCIENCE folks who are used to R and (sadly) Python.

Wait…

We are used to R AND _PYTHON_!

Let's call for aid from our [lesser sibling](https://pyodide.org/en/stable/).

That's right. You aren't dreaming. We're going to put WebR and Pyodide into the same web app!

You'll recognize this idiom in `py.js` since lots of WASM-y things use it. Here, we're loading up Pyodide and making the shrunken `pip` available to install (ugh) `matplotlib` (we'll do that in the code block after this one).

```js
import * as pyodide from 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.mjs'

globalThis.webPy = await pyodide.loadPyodide({
	indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/",
	fullStdLib: true,
});

export let webPy = globalThis.webPy;

await webPy.loadPackage([ "micropip" ]);

export const micropip = webPy.pyimport("micropip");
```

We need to install some packages from Pyodide's package manager, so we add some bits to `main.js` (I'm only showing the changed bits):

```js
message.text = "Pyodide Loading…"

import * as Py from "./py.js"

// get some info from python. This `runPython` is kind of nice to work with tbh.
const res = await Py.webPy.runPython(`
import sys
import json
json.dumps({ 'version': sys.version, 'executable': sys.executable, 'platform': sys.platform }, indent=2)
`)

// display stuffs!
const pyOut = document.getElementById("py-output") // placeholder (see below)
pyOut.innerText = res

const rOut = document.getElementById("r-output") // placeholder (see below)
rOut.innerText = await webR.evalRString("R.version.string")

// I highly suggest opening up DevTools and reloading the page to watch this
message.text = "Installing matplotlib"

await Py.micropip.install("matplotlib")

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

// we get to put that base64 encoded img right into our placeholder (see below)!
const pltOut = document.getElementById("py-plt-output") 
pltOut.src = plt
```

The various output bits go in these placeholder elements (foregoing web components for simplicity):

```html
<pre id="py-output">
</pre>

<pre id="r-output">
</pre>

<img id="py-plt-output"/>
```

### FIN

There are tons more Python packages that can likely fill in the gap while we patiently wait for WebR to be baked a bit more.

I'll add some experiments that show how to have Pyodide and WebR talk to each other, but I think most folks who are following along can figure that out without me.

Source is up [on GitHub](https://github.com/hrbrmstr/webr-pyodide).

<p style="text-align:center;margin-top:2rem;">Brought to you by @hrbrmstr</p>
