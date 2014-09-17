//name: Hermite resize
//about: Fast image resize/resample using Hermite filter with JavaScript.
//author: ViliusL
//demo: http://viliusle.github.io/miniPaint/
function resample(canvas, targetW, targetH) {
  var w = canvas.width;
  var h = canvas.height;
  var w2 = Math.round(targetW);
  var h2 = Math.round(targetH);
  var img = canvas.getContext("2d").getImageData(0, 0, w, h);
  var img2 = canvas.getContext("2d").getImageData(0, 0, w2, h2);
  var data = img.data;
  var data2 = img2.data;
  var ratio_w = w / w2;
  var ratio_h = h / h2;
  var ratio_w_half = Math.ceil(ratio_w/2);
  var ratio_h_half = Math.ceil(ratio_h/2);

  for (var j = 0; j < h2; j++) {
    for (var i = 0; i < w2; i++) {
      var x2 = (i + j*w2) * 4;
      var weight = 0;
      var weights = 0;
      var weights_alpha = 0;
      var gx_r, gx_g, gx_b, gx_a;
      gx_r = gx_g = gx_b = gx_a = 0;
      var center_y = (j + 0.5) * ratio_h;
      for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
        var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
        var center_x = (i + 0.5) * ratio_w;
        var w0 = dy*dy //pre-calc part of w
        for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
          var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
          var w = Math.sqrt(w0 + dx*dx);
          if(w >= -1 && w <= 1){
            //hermite filter
            weight = 2 * w*w*w - 3*w*w + 1;
            if(weight > 0){
              dx = 4*(xx + yy * w);
              //alpha
              gx_a += weight * data[dx + 3];
              weights_alpha += weight;
              //colors
              if(data[dx + 3] < 255)
                weight = weight * data[dx + 3] / 250;
              gx_r += weight * data[dx];
              gx_g += weight * data[dx + 1];
              gx_b += weight * data[dx + 2];
              weights += weight;
            }
          }
        }
      }
      data2[x2]     = gx_r / weights;
      data2[x2 + 1] = gx_g / weights;
      data2[x2 + 2] = gx_b / weights;
      data2[x2 + 3] = gx_a / weights_alpha;
    }
  }

  return img2;
}

function resizeTo(canvas, width, height) {
  var resampledImageData = resample(canvas, canvas.width, canvas.height, width, height);
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").putImageData(resampledImageData, 0, 0);
}

function resizeWidth(canvas, width) {
  return resizeTo(canvas, width, canvas.height * (width / canvas.width));
}

function scale(canvas, wScale, hScale) {
  hScale = hScale || wScale;
  return resizeTo(canvas, canvas.width * wScale, canvas.height * hScale);
}

module.exports = {
  resample: resample,
  resizeTo: resizeTo,
  resizeWidth: resizeWidth,
  scale: scale
};
