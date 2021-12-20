# zcad-bundler
This is an example on how to bundle zcad file into a standalone html file based on a template.

# How it works

The Index.html file is used to load a zcad file, and encode it as a base64 string, and embed that as a Data URI in the targe file.

In the template.html file is a code snippet that looks like the following:

```html
    <script>
      window.ZCAD_URL = "{{ZCAD_URL}}";
      // window.ZCAD_URL =
      //   "http://docs.zea.live/zcad-bundler/data/nist_ctc_02_asme1_ap203.zcad";
    </script>
```

During the templating opration, the template html file is loaded as text, and a simple text replace is applied to insert the zcad file.
 
```javascript
fetch('template.html')
              .then(response => response.text())
              .then(data => {
                let result = data.replace('{{ZCAD_URL}}', reader.result)
                result = result.replace('{{TITLE}}', file.name)
                // result = data.replaceALL('{{BASE_URL}}', document.location.origin)
                const stem = file.name.substring(0, file.name.length -4)
                download(stem+'html', result)
              })

```

# Live Demo

http://docs.zea.live/zcad-bundler/


# Resources

https://github.com/ZeaInc/zcad-bundler/blob/main/template.html#L97-L101

https://github.com/ZeaInc/minimal-zea-viewer

https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs 
https://developer.mozilla.org/en-US/docs/Glossary/Base64
