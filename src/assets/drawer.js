'use strict';

/* 项目信息及画布尺寸定义 */
// define meta info and variable
const imgElement = document.querySelector('.bm-curve');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 928;
canvas.height = 588;
// X轴基础位置
const XbeginPoint = {
  x: 44,
  y: 560
};
const XendPoint = {
  x: 800,
  y: 560
};
// Y轴基础位置
const YbeginPoint = {
  x: 44,
  y: 560
};
const YendPoint = {
  x: 44,
  y: 20
};
// terminplan and parts numbers
const beginWeek = '2019KW20';
const endWeek = '2021KW01';

/* 绘制逻辑 */
// 根据项目进度，零件数量，绘制X，Y坐标
renderXaxis(beginWeek, endWeek);
renderYaxis(1600);

imgElement.src = canvas.toDataURL('image/png');

/* 绘制辅助函数 */

/**
 * 根据零件数量绘制Y轴
 * @param {number} partsNum
 */
function renderYaxis(partsNum) {
  ctx.save();
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
    ctx.font = 'monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${sliceLine * jump}`, YbeginPoint.x - 10, YbeginPoint.y - sliceLine * gap);
    // loop
    sliceLine++;
  }
  ctx.fillText(`${partsNum}`, YendPoint.x - 10, YendPoint.y);

  ctx.restore();
}

/**
 * 根据周数的长度绘制X轴
 * @param {string} startWeek
 * @param {string} endWeek
 */
function renderXaxis(beginWeek, endWeek) {
  ctx.save();

  ctx.font = 'monospace';
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
    ctx.lineTo(startPoint.x, startPoint.y - 5);
    ctx.stroke();
    // 每隔一周标注周数
    if (index % 2 === 0) {
      ctx.fillText(`${week < 10 ? '0' + week : '' + week}`, startPoint.x - width / 2, startPoint.y + 12);
    }
  });

  ctx.restore();
}

/**
 * 根据起始周与结束周，输出项目周期内的周的数组
 * @param {string} startWeek
 * @param {string} endWeek
 */
function getWeeksArray(startWeek, endWeek) {
  const years = Number(endWeek.slice(0, 4)) - Number(startWeek.slice(0, 4));
  const weeks = Number(endWeek.slice(6)) - Number(startWeek.slice(6)) + 1;
  const totalWeeks = weeks < 0 ? (years - 1) * 52 + weeks + 52 : years * 52 + weeks;

  return new Array(totalWeeks).fill(1).map((_, index) => {
    const week = Number(startWeek.slice(6)) + index;
    return ((week - 1) % 52) + 1;
  });
}
