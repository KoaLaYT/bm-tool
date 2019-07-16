module.exports.QPNIHeader = [
  {title: "序号", col: "B"},
  {title: "装车件", col: "C"},
  {title: "跟踪优先级", col: "D"},
  {title: "零件号", col: "F"},
  {title: "德文名", col: "G"},
  {title: "中文名", col: "H"},
  {title: "零件级别", col: "J"},
  {title: "COP", col: "K"},
  {title: "BMG", col: "M"},
  {title: "供货厂商", col: "N"},
  {title: "生产场地", col: "O"},
  {title: "主管工程师", col: "R"},
  {title: "备注", col: "S"},
  {title: "序号", col: "B"},
  {title: "风险", col: "Z"},
  {title: "EM SOLL1", col: "BC"},
  {title: "EM SOLL2", col: "BD"},
  {title: "EM IST", col: "BF"},
  {title: "EM推迟原因", col: "BG"},
  {title: "Q3 SOLL1", col: "BI"},
  {title: "Q3 SOLL2", col: "BJ"},
  {title: "Q3 IST", col: "BK"},
  {title: "N3 IST", col: "BL"},
  {title: "N1 SOLL1", col: "BN"},
  {title: "N1 SOLL2", col: "BO"},
  {title: "N1 IST", col: "BP"},
  {title: "2TP SOLL1", col: "BS"},
  {title: "2TP SOLL2", col: "BT"},
  {title: "2TP IST", col: "BU"},
];

module.exports.MQPLHeader = [
  {title: "序号", source: "CALC"},
  {title: "FG", source: "TIPS", col: "J"},
  {title: "Teile-Nr", source: "TIPS", col: "B"},
  {title: "零件名称", source: "TIPS", col: "F"},
  {title: "Benennung", source: "TIPS", col: "E"},
  {title: "描述", source: "MQPL"},
  {title: "FKZ", source: "TIPS", col: "P"},
  {title: "Narbung", source: "TIPS", col: "O"},
  {title: "MQS股", source: "MQPL"},
  {title: "MQ零件主管", source: "MQPL_QPNI", col: "R"},
  {title: "ZP", source: "TIPS", col: "A"},
  {title: "LCH", source: "TIPS", col: "AI"},
  {title: "COP", source: "TIPS", col: "X"},
  {title: "KickOff IST", source: "TIPS", col: "DN"},
  {title: "AEKO号", 	source: "TIPS", col: "BJ"},
  {title: "CSF AEKO Bemerk", source: "TIPS", col: "CG"},
  {title: "AEKO老零件号", source: "MQPL"},
  {title: "项目BMG属性", source: "TIPS", col: "BN"},
  {title: "Bezug", source: "TIPS", col: "V"},
  {title: "Lieferanten-Code(3)", source: "TIPS", col: "AD"},
  {title: "CS供应商名称", source: "TIPS", col: "AG"},
  {title: "CS/NOMIINFO(EN)", source: "TIPS", col: "AH"},
  {title: "OTS IST", source: "TIPS", col: "EE"},
  {title: "EM SOLL1", source: "MQPL_TIPS", col: "EL"},
  {title: "EM SOLL2", source: "MQPL_TIPS", col: "EM"},
  {title: "EM IST", source: "MQPL_QPNI", col: "BF"},
  {title: "EM VSI Bemerk", source: "TIPS", col: "ES"},
  {title: "MQ Bemerk", source: "MQPL"},
  {title: "Newpro", source: "MQPL"},
  {title: "Newpro Bemerk", source: "MQPL"},
  {title: "认可方式", source: "MQPL"},
  {title: "WPAB", source: "MQPL"},
  {title: "WPAB IST", source: "MQPL"},
  {title: "WPAB Bemerk", source: "MQPL"},
  {title: "Mass", source: "MQPL"},
  {title: "Mass Bemerk", source: "MQPL"},
  {title: "皮纹许可 SOLL", source: "MQPL"},
  {title: "皮纹许可 IST", source: "MQPL"},
  {title: "材料", source: "MQPL"},
  {title: "材料 Bemerk", source: "MQPL"},
  {title: "ELV", source: "MQPL"},
  {title: "ELV Bemerk", source: "MQPL"},
  {title: "性能/表面", source: "MQPL"},
  {title: "性能/表面 Bemerk", source: "MQPL"},
  {title: "N6 EM VSI", source: "MQPL"},
  {title: "N6 EM IST", source: "MQPL"},
  {title: "N6 EM Bemerk", source: "MQPL"},
  {title: "Newpro taskinfo", source: "TIPS", col: "CA"},
  {title: "OTS Bemerk", source: "TIPS", col: "EJ"},
  {title: "CS EM Bemerk", source: "TIPS", col: "AP"},
  {title: "Q3 Dauer/KW", source: "MQPL"},
  {title: "Q3 SOLL2", source: "MQPL_QPNI", col: "BI"},
  {title: "Q3 SOLL3", source: "MQPL_QPNI", col: "BJ"},
  {title: "Q3 Bemerk", source: "MQPL"},
  {title: "Q3 IST", source: "MQPL_QPNI", col: "BK"},
  {title: "Q1 Dauer/KW", source: "MQPL"},
  {title: "Q1 SOLL2", source: "MQPL"},
  {title: "Q1 SOLL3", source: "MQPL"},
  {title: "Q1 Bemerk", source: "MQPL"},
  {title: "EBV SOLL", source: "MQPL"},
  {title: "EBV IST", source: "MQPL"},
  {title: "Q1 IST", source: "MQPL"},
  {title: "EBV 装车号", source: "MQPL"},
  {title: "EBV 实际结果", source: "MQPL"},
  {title: "N1 SOLL1", source: "MQPL_QPNI", col: "BN"},
  {title: "N1 SOLL2", source: "MQPL_QPNI", col: "BO"},
  {title: "MQ Bemerk1", source: "MQPL"},
  {title: "MQ Bemerk2", source: "MQPL"},
  {title: "MQ Bemerk3", source: "MQPL"},
  {title: "MQ Bemerk4", source: "MQPL"},
  {title: "MQ Bemerk5", source: "MQPL"},
  {title: "CCC零件SOLL", source: "MQPL"},
  {title: "CCC零件IST", source: "MQPL"},
  {title: "EMPB号", source: "MQPL"},
  {title: "EMPB Bemerk", source: "MQPL"},
  {title: "项目名称", source: "MQPL"},
  {title: "FE54 Bemerk", source: "MQPL"},
  {title: "BMG SOLL", source: "MQPL"},
  {title: "BMG IST", source: "MQPL"},
  {title: "BMG akt", source: "MQPL"},
  {title: "FE54 SOLL", source: "MQPL"},
  {title: "FE54 ia", source: "MQPL"},
  {title: "FE54 IST", source: "MQPL"},
  {title: "EMPB SOLL", source: "MQPL"},
  {title: "N3", source: "MQPL"},
  {title: "N3 原因", source: "MQPL"},
  {title: "N3转N1 SOLL", source: "MQPL"},
  {title: "Note 3 IST", source: "MQPL_QPNI", col: "BL"},
  {title: "Note 1 IST", source: "MQPL_QPNI", col: "BP"},
  {title: "N1 Newpro", source: "MQPL"},
  {title: "MQ-id", source: "TIPS", col: "BG"},
  {title: "FE54 Nr", source: "MQPL"},
  {title: "2TP SOLL1", source: "MQPL_QPNI", col: "BS"},
  {title: "2TP SOLL2", source: "MQPL_QPNI", col: "BT"},
  {title: "2TP Bemerk", source: "MQPL"},
  {title: "2TP IST", source: "MQPL_QPNI", col: "BU"}
];
