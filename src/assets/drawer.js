'use strict';

const ipcRenderer = require('electron').ipcRenderer;
/* 项目信息及画布尺寸定义 */
// define meta info and variable
const bmCurveContainer = document.querySelector('.bm-curve-container');
const bmImg = document.querySelector('.bm-curve');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const RATIO = 1;
const fontStyle = '12px Arial';

canvas.width = 928 * RATIO;
canvas.height = 588 * RATIO;
// X轴基础位置
const XbeginPoint = {
  x: 30 * RATIO,
  y: 520 * RATIO
};
const XendPoint = {
  x: 770 * RATIO,
  y: 520 * RATIO
};
// Y轴基础位置
const YbeginPoint = {
  x: 30 * RATIO,
  y: 520 * RATIO
};
const YendPoint = {
  x: 30 * RATIO,
  y: 10 * RATIO
};
// 定义绘制的内容
const drawMetaInfo = [
  {
    type: 'ZP7',
    pillars: ['EM Offen', 'Spaete.EMT', 'Abgel.EMT', 'Note6', 'M/L i.A', 'Q3', 'EBV i.A', 'FE54 i.A', 'Note3', 'Note1'],
    curves: ['Q3 SOLL', 'Q1 SOLL', 'Gesamt', 'IST', 'SOLL']
  },
  {
    type: 'ZP5',
    pillars: ['EM Offen', 'Spaete.EMT', 'Abgel.EMT', 'Note6', 'M/L i.A', 'Q3', 'Note3', 'Note1'],
    curves: ['IST', 'SOLL', 'Gesamt', 'Q3 SOLL', 'Q1 SOLL']
  }
];
// 定义计算的函数
const calc__funcs = {
  // pillars
  'EM Offen': calc__EMOFFEN,
  'Spaete.EMT': calc__SpaeteEMT,
  'Abgel.EMT': calc__AbgelEMT,
  Note6: calc__NOTE6,
  'M/L i.A': calc__MLIA,
  Q3: calc__Q3,
  'EBV i.A': calc__EBVIA,
  'FE54 i.A': calc__FE54IA,
  Note3: calc__Note3,
  Note1: calc__Note1,
  // curves
  'Q3 SOLL': calc__Q3SOLL,
  'Q1 SOLL': calc__Q1SOLL,
  Gesamt: calc__Gesamt,
  IST: calc__IST,
  SOLL: calc__SOLL
};
// 定义曲线的颜色
const colors = {
  // pillar
  'EM Offen': 'black',
  'Spaete.EMT': 'rgb(240,240,240)',
  'Abgel.EMT': 'rgb(255,156,13)',
  Note6: 'red',
  'M/L i.A': 'rgb(51,102,255)',
  Q3: 'rgb(167,186,70)',
  'EBV i.A': 'rgb(5,213,255)',
  'FE54 i.A': 'rgb(135,187,158)',
  Note3: 'rgb(255,255,0)',
  Note1: 'rgb(0,128,0)',
  // curve
  'Q3 SOLL': 'rgb(255,203,0)',
  'Q1 SOLL': 'rgb(26,141,26)',
  Gesamt: 'red',
  IST: 'rgb(113,220,220)',
  SOLL: 'rgb(0,0,255)'
};
// 获取项目基本信息
let metaInfo = undefined;
ipcRenderer.on('drawCurve', (event, info) => {
  metaInfo = info;
});
// 根据需求，绘制对应曲线
const buttons = document.querySelectorAll('li');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // 设置背景色
    const prevSelected = document.querySelector('li.pink');
    if (prevSelected) {
      prevSelected.classList.remove('pink', 'darken-1');
      prevSelected.classList.add('blue', 'darken-4');
    }
    btn.classList.remove('blue', 'darken-4');
    btn.classList.add('pink', 'darken-1');
    // 清空画布与背景图片
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bmImg.src = bmCurveContainer.href = '';
    renderBMC(btn.innerHTML, metaInfo.dateInfo.currentKW);
  });
});

/* 绘制逻辑 */
function renderBMC(type, currentKW) {
  let partsNum;
  switch (type) {
    case 'ZP7':
      partsNum = metaInfo.MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).length;
      break;
    case 'ZP5 Gesamt':
      partsNum = metaInfo.MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').length;
      break;
    case 'ZP5 KT':
      partsNum = metaInfo.MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).length;
      break;
    case 'ZP5 HT':
      partsNum = metaInfo.MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').length;
      break;
    case 'ZP5 ZSB':
      partsNum = metaInfo.MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').length;
      break;
    default:
      partsNum = 0;
      break;
  }

  renderXaxis(metaInfo.dateInfo.startWeek, metaInfo.dateInfo.endWeek);
  renderYaxis(partsNum);

  const fullTermin = getFullWeeksArray(metaInfo.dateInfo.startWeek, metaInfo.dateInfo.endWeek);
  const info = drawMetaInfo.find(info => type.includes(info.type));

  const width = (XendPoint.x - XbeginPoint.x) / fullTermin.length;
  const height = (YbeginPoint.y - YendPoint.y) / partsNum;
  // 对每周绘制柱状图
  const curvesPoints = {
    'Q3 SOLL': [],
    'Q1 SOLL': [],
    Gesamt: [],
    IST: [],
    SOLL: []
  };
  fullTermin.forEach((date, index) => {
    let accNumOfPillar = 0;
    if (date <= currentKW) {
      info.pillars.forEach(pillar => {
        const num = calc__funcs[pillar](metaInfo.MQPL, date, type);
        const startPoint = {
          x: XbeginPoint.x + width * index + 1 * RATIO,
          y: YendPoint.y + height * accNumOfPillar
        };
        renderPillar(startPoint, width - 2 * RATIO, num * height, colors[pillar]);
        accNumOfPillar += num;
      });
    }
    // 记录曲线坐标
    info.curves.forEach(curve => {
      if (curve === 'IST' && date > currentKW) {
        return;
      }
      const num = calc__funcs[curve](metaInfo.MQPL, date, type);
      const point = {
        x: XbeginPoint.x + width * index + 1 * RATIO + (width - 2 * RATIO) / 2,
        y: YbeginPoint.y - height * num
      };
      curvesPoints[curve].push(point);
    });
  });
  // 绘制预测柱子
  if (metaInfo.dateInfo.prognose[type]['PrognoseKW' + type]) {
    const prognoseInfo = metaInfo.dateInfo.prognose[type];
    console.log(prognoseInfo);
    const prognoseKW = prognoseInfo['PrognoseKW' + type];
    const startKW = metaInfo.dateInfo.startWeek;
    const index = getWeeksArray(startKW, prognoseKW).length - 1;
    let accNumOfPillar = 0;
    info.pillars.forEach(pillar => {
      const startPoint = {
        x: XbeginPoint.x + width * index + 1 * RATIO,
        y: YendPoint.y + height * accNumOfPillar
      };
      const num = prognoseInfo[pillar + type] || 0;

      renderPillar(startPoint, width - 2 * RATIO, num * height, colors[pillar]);
      accNumOfPillar += num;
    });
  }
  // 绘制曲线
  for (const curve in curvesPoints) {
    renderCurve(curvesPoints[curve], colors[curve]);
  }
  // 绘制标签
  info.pillars.forEach((pillar, index) => {
    const point = {
      x: XendPoint.x + 5 * RATIO,
      y: YendPoint.y + index * 30 * RATIO
    };
    const text = `${pillar} = ${calc__funcs[pillar](metaInfo.MQPL, currentKW, type)}`;
    renderLabel(point, text, colors[pillar], 'pillar');
  });
  info.curves.forEach((curve, index) => {
    const point = {
      x: XendPoint.x + 5 * RATIO,
      y: YendPoint.y + (10 + index * 30) * RATIO + info.pillars.length * 30 * RATIO
    };
    let text;
    if (type === 'ZP7' && (curve === 'Q3 SOLL' || curve === 'Q1 SOLL')) {
      text = `${curve}`;
    } else {
      if (type !== 'ZP7' && curve === 'Q1 SOLL') {
        text = `Note1 SOLL = ${calc__funcs[curve](metaInfo.MQPL, currentKW, type)}`;
      } else {
        text = `${curve} = ${calc__funcs[curve](metaInfo.MQPL, currentKW, type)}`;
      }
    }
    renderLabel(point, text, colors[curve]);
  });
  // 绘制项目节点
  const terminType = type.includes('ZP7') ? 'ZP7' : 'ZP5';
  Object.entries(metaInfo.dateInfo.terminplan[terminType]).forEach(([termin, KW]) => {
    const index = fullTermin.indexOf(KW);
    const point = {
      x: XbeginPoint.x + index * width + width / 2,
      y: XbeginPoint.y + 15 * RATIO
    };

    let text1 = termin.slice(3);
    if (metaInfo.dateInfo.isDualPVS) {
      text1 = text1.replace('PVS', 'PVS2');
      text1 = text1.replace('VFF', 'PVS1');
    }
    const text2 = KW.slice(5);
    const dashed = /TBT/i.test(termin);

    renderTermin(point, text1, text2, dashed);
  });

  bmImg.src = bmCurveContainer.href = canvas.toDataURL('image/png');
}

/* 绘制辅助函数 */

function renderTermin(point, text1, text2, dashed) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'red';
  // 绘制箭头
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x - 8 * RATIO, point.y + 10 * RATIO);
  ctx.lineTo(point.x - 4 * RATIO, point.y + 10 * RATIO);
  ctx.lineTo(point.x - 4 * RATIO, point.y + 20 * RATIO);
  ctx.lineTo(point.x + 4 * RATIO, point.y + 20 * RATIO);
  ctx.lineTo(point.x + 4 * RATIO, point.y + 10 * RATIO);
  ctx.lineTo(point.x + 8 * RATIO, point.y + 10 * RATIO);
  ctx.lineTo(point.x, point.y);
  ctx.fill();
  // 绘制线条
  if (dashed) {
    ctx.setLineDash([10 * RATIO, 3 * RATIO]);
  }
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, YendPoint.y - 10 * RATIO);
  ctx.stroke();
  // 添加描述
  ctx.font = fontStyle;
  if (dashed) {
    ctx.textAlign = 'right';
    ctx.fillText(text1, point.x + 4 * RATIO, point.y + 32 * RATIO);
    ctx.fillText(text2, point.x + 4 * RATIO, point.y + 44 * RATIO);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(text1, point.x - 4 * RATIO, point.y + 32 * RATIO);
    ctx.fillText(text2, point.x - 4 * RATIO, point.y + 44 * RATIO);
  }

  ctx.restore();
}

function renderLabel(point, text, color, type) {
  ctx.save();

  ctx.font = fontStyle;
  ctx.fillStyle = color;
  if (type === 'pillar') {
    ctx.fillRect(point.x, point.y, 20 * RATIO, 10 * RATIO);
  } else {
    ctx.fillRect(point.x, point.y + 4 * RATIO, 20 * RATIO, 2 * RATIO);
  }

  ctx.fillStyle = 'black';
  ctx.fillText(text, point.x + 20 * RATIO + 5, point.y + 10 * RATIO);
  ctx.restore();
}

function renderCurve(points, color) {
  ctx.save();

  ctx.lineWidth = 2 * RATIO;
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function renderPillar(startPoint, width, height, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(startPoint.x, startPoint.y, width, height);
  ctx.restore();
}

/**
 * 根据零件数量绘制Y轴
 * @param {number} partsNum
 */
function renderYaxis(partsNum) {
  ctx.save();
  ctx.font = fontStyle;
  // Y基础轴
  ctx.beginPath();
  ctx.moveTo(YbeginPoint.x, YbeginPoint.y);
  ctx.lineTo(YendPoint.x, YendPoint.y);
  ctx.moveTo(XendPoint.x, YbeginPoint.y);
  ctx.lineTo(XendPoint.x, YendPoint.y);
  ctx.stroke();
  // 为Y轴添加分割线
  let sliceLine = 1;
  const jump = (Math.floor(partsNum / 100) + 1) * 20;
  const gap = ((YbeginPoint.y - YendPoint.y) / partsNum) * jump;
  while (YbeginPoint.y - sliceLine * gap > YendPoint.y) {
    ctx.strokeStyle = '#CCC';
    ctx.beginPath();
    ctx.moveTo(YbeginPoint.x, YbeginPoint.y - sliceLine * gap);
    ctx.lineTo(XendPoint.x, YbeginPoint.y - sliceLine * gap);
    ctx.stroke();
    // 标注数量
    ctx.strokeStyle = '#000';
    ctx.textAlign = 'right';
    ctx.fillText(`${sliceLine * jump}`, YbeginPoint.x - 2 * RATIO, YbeginPoint.y - sliceLine * gap);
    // loop
    sliceLine++;
  }
  ctx.fillText(`${partsNum}`, YendPoint.x - 2 * RATIO, YendPoint.y);

  ctx.restore();
}

/**
 * 根据周数的长度绘制X轴
 * @param {string} startWeek
 * @param {string} endWeek
 */
function renderXaxis(beginWeek, endWeek) {
  ctx.save();

  ctx.font = fontStyle;
  ctx.textAlign = 'center';
  // basic X axis
  ctx.beginPath();
  ctx.moveTo(XbeginPoint.x, XbeginPoint.y);
  ctx.lineTo(XendPoint.x, XendPoint.y);
  ctx.stroke();

  // 根据周数绘制刻度线, 并标注周数
  const weeksArray = getWeeksArray(beginWeek, endWeek);
  const width = (XendPoint.x - XbeginPoint.x) / weeksArray.length;

  weeksArray.forEach((week, index) => {
    const startPoint = {
      x: XbeginPoint.x + width * (index + 1),
      y: XbeginPoint.y
    };
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(startPoint.x, startPoint.y - 5 * RATIO);
    ctx.stroke();
    // 每隔一周标注周数
    if (index % 2 === 0) {
      ctx.fillText(`${week < 10 ? '0' + week : '' + week}`, startPoint.x - width / 2, startPoint.y + 14 * RATIO);
    }
  });

  ctx.restore();
}

/**
 * 根据起始周与结束周，输出包含年份信息的项目周期
 * @param {string} startWeek
 * @param {string} endWeek
 */
function getFullWeeksArray(startWeek, endWeek) {
  const result = [];

  let currentWeek = startWeek;
  while (currentWeek <= endWeek) {
    result.push(currentWeek);
    let week = Number(currentWeek.slice(7));
    let year = Number(currentWeek.slice(0, 4));

    if (week + 1 > 52) {
      year = year + 1;
    }
    week = (week % 52) + 1;
    week = week < 10 ? '0' + week : week;
    currentWeek = year + '-KW' + week;
  }

  return result;
}

/**
 * 根据起始周与结束周，输出项目周期内的周的数组
 * @param {string} startWeek
 * @param {string} endWeek
 */
function getWeeksArray(startWeek, endWeek) {
  const years = Number(endWeek.slice(0, 4)) - Number(startWeek.slice(0, 4));
  const weeks = Number(endWeek.slice(7)) - Number(startWeek.slice(7)) + 1;
  const totalWeeks = weeks < 0 ? (years - 1) * 52 + weeks + 52 : years * 52 + weeks;

  return new Array(totalWeeks).fill(1).map((_, index) => {
    const week = Number(startWeek.slice(7)) + index;
    return ((week - 1) % 52) + 1;
  });
}

/**
 * 统计零件认可状态的计算函数
 * type: 'ZP7' | 'ZP5 Gesamt' | 'ZP5 HT' | 'ZP5 KT' | 'ZP5 ZSB' | 'CKD'
 */

function calc__EMOFFEN(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => !row['EM SOLL1']).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => !row['EM SOLL1']).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => !row['EM SOLL1']).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => !row['EM SOLL1']).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => !row['EM SOLL1']).length;
  }
}

function calc__SpaeteEMT(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => row['EM SOLL1'] > currentKW).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => row['EM SOLL1'] > currentKW).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => row['EM SOLL1'] > currentKW).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => row['EM SOLL1'] > currentKW).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => row['EM SOLL1'] > currentKW).length;
  }
}

function calc__AbgelEMT(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW && !row['EM IST'];
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW && !row['EM IST'];
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW && !row['EM IST'];
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW && !row['EM IST'];
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW && !row['EM IST'];
      }).length;
  }
}

function calc__NOTE6(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return 0;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return 0;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return 0;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return 0;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return 0;
      }).length;
  }
}

function calc__MLIA(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM IST'] && row['EM IST'] <= currentKW && !row['Q3 IST'];
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM IST'] && row['EM IST'] <= currentKW && !row['Q3 IST'];
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM IST'] && row['EM IST'] <= currentKW && !row['Q3 IST'];
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM IST'] && row['EM IST'] <= currentKW && !row['Q3 IST'];
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM IST'] && row['EM IST'] <= currentKW && !row['Q3 IST'];
      }).length;
  }
}

function calc__Q3(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['Q3 IST'] && row['Q3 IST'] <= currentKW && !row['EBV SOLL'];
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['Q3 IST'] && row['Q3 IST'] <= currentKW && !row['Note 3 IST'];
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['Q3 IST'] && row['Q3 IST'] <= currentKW && !row['Note 3 IST'];
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['Q3 IST'] && row['Q3 IST'] <= currentKW && !row['Note 3 IST'];
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['Q3 IST'] && row['Q3 IST'] <= currentKW && !row['Note 3 IST'];
      }).length;
  }
}

function calc__EBVIA(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EBV SOLL'] && row['EBV SOLL'] <= currentKW && !row['Q1 IST'];
      }).length;
  }
}

function calc__FE54IA(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['Q1 IST'] && row['FE54 ia'] && row['FE54 ia'] <= currentKW && !row['FE54 IST'];
      }).length;
  }
}

function calc__Note3(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['Note 3 IST'] && row['Note 3 IST'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['Note 3 IST'] && row['Note 3 IST'] <= currentKW && !row['Note 1 IST'];
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['Note 3 IST'] && row['Note 3 IST'] <= currentKW && !row['Note 1 IST'];
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['Note 3 IST'] && row['Note 3 IST'] <= currentKW && !row['Note 1 IST'];
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['Note 3 IST'] && row['Note 3 IST'] <= currentKW && !row['Note 1 IST'];
      }).length;
  }
}

function calc__Note1(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['Note 1 IST'] && row['Note 1 IST'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['Note 1 IST'] && row['Note 1 IST'] <= currentKW;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['Note 1 IST'] && row['Note 1 IST'] <= currentKW;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['Note 1 IST'] && row['Note 1 IST'] <= currentKW;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['Note 1 IST'] && row['Note 1 IST'] <= currentKW;
      }).length;
  }
}

function calc__Q3SOLL(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM SOLL1'] && row['Q3 SOLL2'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM SOLL1'] && row['Q3 SOLL2'] <= currentKW;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM SOLL1'] && row['Q3 SOLL2'] <= currentKW;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM SOLL1'] && row['Q3 SOLL2'] <= currentKW;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM SOLL1'] && row['Q3 SOLL2'] <= currentKW;
      }).length;
  }
}

function calc__Q1SOLL(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM SOLL1'] && row['Q1 SOLL2'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM SOLL1'] && row['N1 SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM SOLL1'] && row['N1 SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM SOLL1'] && row['N1 SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM SOLL1'] && row['N1 SOLL1'] <= currentKW;
      }).length;
  }
}

function calc__Gesamt(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').length;
  }
}

function calc__IST(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM SOLL1'] && row['EM IST'] && row['EM IST'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM SOLL1'] && row['EM IST'] && row['EM IST'] <= currentKW;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM SOLL1'] && row['EM IST'] && row['EM IST'] <= currentKW;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM SOLL1'] && row['EM IST'] && row['EM IST'] <= currentKW;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM SOLL1'] && row['EM IST'] && row['EM IST'] <= currentKW;
      }).length;
  }
}

function calc__SOLL(MQPL, currentKW, type) {
  switch (type) {
    case 'ZP7':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && (row['ZP'] === 'ZP7' || row['ZP'] === 'ZP5A')).filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 Gesamt':
      return MQPL.filter(row => row['Bezug'] !== 'CKD' && row['ZP'] === 'ZP5').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 KT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && (row['Bezug'] === 'LC' || row['Bezug'] === 'LC1')).filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 HT':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'HT').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW;
      }).length;
    case 'ZP5 ZSB':
      return MQPL.filter(row => row['ZP'] === 'ZP5' && row['Bezug'] === 'ZSB').filter(row => {
        return row['EM SOLL1'] && row['EM SOLL1'] <= currentKW;
      }).length;
  }
}
