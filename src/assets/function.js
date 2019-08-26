module.exports = {
  Q3Soll2: row =>
    `if(
      X${row}="",
      "",
      if(
        AY${row}="",
        "",
        if(
          AS${row}="",
          if(
            (right(X${row}, 2)+AY${row})>52,
            (left(X${row}, 4)+1)&"-KW"&if(
                                          (right(X${row}, 2)+AY${row}-52)<10,
                                          "0"&(right(X${row}, 2)+AY${row}-52),
                                          (right(X${row}, 2)+AY${row}-52)
                                        ),
            left(X${row}, 4)&"-KW"&if(
                                      (right(X${row}, 2)+AY${row})<10,
                                      "0"&(right(X${row}, 2)+AY${row}),
                                      (right(X${row}, 2)+AY${row})
                                    )
          ),
          if(
            AT${row}="",
            if(
              (right(AS${row}, 2)+AY${row})>52,
              (left(AS${row}, 4)+1)&"-KW"&if(
                                            (right(AS${row}, 2)+AY${row}-52)<10,
                                            "0"&(right(AS${row}, 2)+AY${row}-52),
                                            (right(AS${row}, 2)+AY${row}-52)
                                          ),
              left(AS${row}, 4)&"-KW"&if(
                                        (right(AS${row}, 2)+AY${row})<10,
                                        "0"&(right(AS${row}, 2)+AY${row}),
                                        (right(AS${row}, 2)+AY${row})
                                      )
            ),
            if(
              (right(AT${row}, 2)+AY${row})>52,
              (left(AT${row}, 4)+1)&"-KW"&if(
                                            (right(AT${row}, 2)+AY${row}-52)<10,
                                            "0"&(right(AT${row}, 2)+AY${row}-52),
                                            (right(AT${row}, 2)+AY${row}-52)
                                          ),
              left(AT${row}, 4)&"-KW"&if(
                                        (right(AT${row}, 2)+AY${row})<10,
                                        "0"&(right(AT${row}, 2)+AY${row}),
                                        (right(AT${row}, 2)+AY${row})
                                      )
            )
          )
        )
      )
    )`,
  Q3Soll3: row =>
    `if(
      X${row}="",
      "",
      if(
        AY${row}="",
        "",
        if(
          AS${row}="",
          if(
            (right(Y${row}, 2)+AY${row})>52,
            (left(Y${row}, 4)+1)&"-KW"&if(
                                          (right(Y${row}, 2)+AY${row}-52)<10,
                                          "0"&(right(Y${row}, 2)+AY${row}-52),
                                          (right(Y${row}, 2)+AY${row}-52)
                                        ),
            left(Y${row}, 4)&"-KW"&if(
                                      (right(Y${row}, 2)+AY${row})<10,
                                      "0"&(right(Y${row}, 2)+AY${row}),
                                      (right(Y${row}, 2)+AY${row})
                                    )
          ),
          if(
            AT${row}="",
            if(
              (right(AS${row}, 2)+AY${row})>52,
              (left(AS${row}, 4)+1)&"-KW"&if(
                                            (right(AS${row}, 2)+AY${row}-52)<10,
                                            "0"&(right(AS${row}, 2)+AY${row}-52),
                                            (right(AS${row}, 2)+AY${row}-52)
                                          ),
              left(AS${row}, 4)&"-KW"&if(
                                        (right(AS${row}, 2)+AY${row})<10,
                                        "0"&(right(AS${row}, 2)+AY${row}),
                                        (right(AS${row}, 2)+AY${row})
                                      )
            ),
            if(
              (right(AT${row}, 2)+AY${row})>52,
              (left(AT${row}, 4)+1)&"-KW"&if(
                                            (right(AT${row}, 2)+AY${row}-52)<10,
                                            "0"&(right(AT${row}, 2)+AY${row}-52),
                                            (right(AT${row}, 2)+AY${row}-52)
                                          ),
              left(AT${row}, 4)&"-KW"&if(
                                        (right(AT${row}, 2)+AY${row})<10,
                                        "0"&(right(AT${row}, 2)+AY${row}),
                                        (right(AT${row}, 2)+AY${row})
                                      )
            )
          )
        )
      )
    )`,
  Q1Soll2: (row, pvsTime, PVSYear, PVSKW) =>
    `if(
      X${row}="",
      "",
      if(
        BD${row}="",
        "",
        if(
          AS${row}="",
          if(
            (right(X${row}, 2)+BD${row})>52,
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(X${row}, 4)+1)&"-KW"&if(
                                            (right(X${row}, 2)+BD${row}-52)<10,
                                            "0"&(right(X${row}, 2)+BD${row}-52),
                                            (right(X${row}, 2)+BD${row}-52)
                                          )
            ),
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(X${row}, 4))&"-KW"&if(
                                            (right(X${row}, 2)+BD${row})<10,
                                            "0"&(right(X${row}, 2)+BD${row}),
                                            (right(X${row}, 2)+BD${row})
                                          )
            )
          ),
          if(
            AT${row}="",
            if(
              (right(AS${row}, 2)+BD${row})>52,
              if(
                OR(
                  (left(AS${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AS${row}, 4)+1)=${PVSYear},
                    (right(AS${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AS${row}, 4)+1)&"-KW"&if(
                                              (right(AS${row}, 2)+BD${row}-52)<10,
                                              "0"&(right(AS${row}, 2)+BD${row}-52),
                                              (right(AS${row}, 2)+BD${row}-52)
                                            )
              ),
              if(
                OR(
                  (left(AS${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AS${row}, 4)+1)=${PVSYear},
                    (right(AS${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AS${row}, 4))&"-KW"&if(
                                              (right(AS${row}, 2)+BD${row})<10,
                                              "0"&(right(AS${row}, 2)+BD${row}),
                                              (right(AS${row}, 2)+BD${row})
                                            )
              )
            ),
            if(
              (right(AT${row}, 2)+BD${row})>52,
              if(
                OR(
                  (left(AT${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AT${row}, 4)+1)=${PVSYear},
                    (right(AT${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AT${row}, 4)+1)&"-KW"&if(
                                              (right(AT${row}, 2)+BD${row}-52)<10,
                                              "0"&(right(AT${row}, 2)+BD${row}-52),
                                              (right(AT${row}, 2)+BD${row}-52)
                                            )
              ),
              if(
                OR(
                  (left(AT${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AT${row}, 4)+1)=${PVSYear},
                    (right(AT${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AT${row}, 4))&"-KW"&if(
                                              (right(AT${row}, 2)+BD${row})<10,
                                              "0"&(right(AT${row}, 2)+BD${row}),
                                              (right(AT${row}, 2)+BD${row})
                                            )
              )
            )
          )
        )
      )
    )`,
  Q1Soll3: (row, pvsTime, PVSYear, PVSKW) =>
    `if(
      X${row}="",
      "",
      if(
        BD${row}="",
        "",
        if(
          AS${row}="",
          if(
            (right(Y${row}, 2)+BD${row})>52,
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(Y${row}, 4)+1)&"-KW"&if(
                                            (right(Y${row}, 2)+BD${row}-52)<10,
                                            "0"&(right(Y${row}, 2)+BD${row}-52),
                                            (right(Y${row}, 2)+BD${row}-52)
                                          )
            ),
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(Y${row}, 4))&"-KW"&if(
                                            (right(Y${row}, 2)+BD${row})<10,
                                            "0"&(right(Y${row}, 2)+BD${row}),
                                            (right(Y${row}, 2)+BD${row})
                                          )
            )
          ),
          if(
            AT${row}="",
            if(
              (right(AS${row}, 2)+BD${row})>52,
              if(
                OR(
                  (left(AS${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AS${row}, 4)+1)=${PVSYear},
                    (right(AS${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AS${row}, 4)+1)&"-KW"&if(
                                              (right(AS${row}, 2)+BD${row}-52)<10,
                                              "0"&(right(AS${row}, 2)+BD${row}-52),
                                              (right(AS${row}, 2)+BD${row}-52)
                                            )
              ),
              if(
                OR(
                  (left(AS${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AS${row}, 4)+1)=${PVSYear},
                    (right(AS${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AS${row}, 4))&"-KW"&if(
                                              (right(AS${row}, 2)+BD${row})<10,
                                              "0"&(right(AS${row}, 2)+BD${row}),
                                              (right(AS${row}, 2)+BD${row})
                                            )
              )
            ),
            if(
              (right(AT${row}, 2)+BD${row})>52,
              if(
                OR(
                  (left(AT${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AT${row}, 4)+1)=${PVSYear},
                    (right(AT${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AT${row}, 4)+1)&"-KW"&if(
                                              (right(AT${row}, 2)+BD${row}-52)<10,
                                              "0"&(right(AT${row}, 2)+BD${row}-52),
                                              (right(AT${row}, 2)+BD${row}-52)
                                            )
              ),
              if(
                OR(
                  (left(AT${row}, 4)+1)<${PVSYear},
                  AND(
                    (left(AT${row}, 4)+1)=${PVSYear},
                    (right(AT${row}, 2)+BD${row}-52) <= ${PVSKW}
                  )
                ),
                "${pvsTime}",
                (left(AT${row}, 4))&"-KW"&if(
                                              (right(AT${row}, 2)+BD${row})<10,
                                              "0"&(right(AT${row}, 2)+BD${row}),
                                              (right(AT${row}, 2)+BD${row})
                                            )
              )
            )
          )
        )
      )
    )`,
  Q3Dauer: row =>
    `
  if(
    X${row}="",
    "",
    if(
      BA${row}="",
      if(
        AZ${row}="",
        "",
        if(
          right(AZ${row},2)-right(X${row},2)<0,
          right(AZ${row},2)-right(X${row},2)+52,
          right(AZ${row},2)-right(X${row},2)
        )
      ),
      if(
        right(BA${row},2)-right(Y${row},2)<0,
        right(BA${row},2)-right(Y${row},2)+52,
        right(BA${row},2)-right(Y${row},2)
      )
    )
  )
  `,
  Q1Dauer: row =>
    `
  if(
    X${row}="",
    "",
    if(
      BN${row}="",
      if(
        BM${row}="",
        "",
        if(
          right(BM${row},2)-right(X${row},2)<0,
          right(BM${row},2)-right(X${row},2)+52,
          right(BM${row},2)-right(X${row},2)
        )
      ),
      if(
        right(BN${row},2)-right(Y${row},2)<0,
        right(BN${row},2)-right(Y${row},2)+52,
        right(BN${row},2)-right(Y${row},2)
      )
    )
  )
  `,
  FE54ia: row =>
    `
  if(
    BZ${row}="",
    "",
    if(
      BJ${row}="",
      "",
      BJ${row}
    )
  )
  `,
  N3: row =>
    `
  if(
    BZ${row}="",
    if(
      BJ${row}="",
      "",
      if(
        OR(
          Upper(AI${row})="T3",
          Upper(AM${row})="T3",
          Upper(AO${row})="T3"
        ),
        BJ${row},
        ""
      )
    ),
    if(
      CE${row}="",
      "",
      if(
        OR(
          Upper(AI${row})="T3",
          Upper(AM${row})="T3",
          Upper(AO${row})="T3"
        ),
        CE${row},
        ""
      )
    )
  )
  `,
  N1: row =>
    `
  if(
    BZ${row}="",
    if(
      BJ${row}="",
      "",
      if(
        AND(
          Upper(AI${row})<>"T3",
          Upper(AM${row})<>"T3",
          Upper(AO${row})<>"T3"
        ),
        BJ${row},
        ""
      )
    ),
    if(
      CE${row}="",
      "",
      if(
        AND(
          Upper(AI${row})<>"T3",
          Upper(AM${row})<>"T3",
          Upper(AO${row})<>"T3"
        ),
        CE${row},
        ""
      )
    )
  )
  `
};
