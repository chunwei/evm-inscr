export {}
// 1 file filesize=52
// unSigned
// txSize { size: 137, bsize: 137, vsize: 137, weight: 548 }
// Signed
// txSize { size: 415, bsize: 137, vsize: 207, weight: 826 }   70  + witness (826-548 =278) /4 =69.5
//                                                             278 -104 = 174
//                                                             207 -175 = 32
// 2 files filesize=52
// txSize { size: 180, bsize: 180, vsize: 180, weight: 720 }   43 + 1 vout
// txSize { size: 458, bsize: 180, vsize: 250, weight: 998 }   70
// txSize { size: 372, bsize: 94, vsize: 164, weight: 654 }
//                                                             250 +164 -175*2 = 64

// 3 files filesize=52
// txSize { size: 223, bsize: 223, vsize: 223, weight: 892 }   43  + 1 vout
// txSize { size: 501, bsize: 223, vsize: 293, weight: 1170 }  70
// txSize { size: 372, bsize: 94, vsize: 164, weight: 654 }
// txSize { size: 372, bsize: 94, vsize: 164, weight: 654 }
//                                                             293+164*2 -175*3 = 96

// 3 files filesize=52*2 =104
// txSize { size: 223, bsize: 223, vsize: 223, weight: 892 }
// txSize { size: 607, bsize: 223, vsize: 319, weight: 1276 }  withness 1276-892 =384  384-278 = 106
// txSize { size: 478, bsize: 94, vsize: 190, weight: 760 }    26 + w, 106/4 =26.5
// txSize { size: 478, bsize: 94, vsize: 190, weight: 760 }
//                                                             319+190*2 -175*3 = 174  174/3 =58

// 3 files filesize=52*3 =156
// txSize { size: 223, bsize: 223, vsize: 223, weight: 892 }   1381 1276-892 =489  489-384 =105
// txSize { size: 712, bsize: 223, vsize: 346, weight: 1381 }
// txSize { size: 583, bsize: 94, vsize: 217, weight: 865 }  865- 760 =105
// txSize { size: 583, bsize: 94, vsize: 217, weight: 865 }
//                                                             346+217*2 -175*3 = 255  255/3 =85

// size =  nonwitness + witness
// weight = nonwitness*4 + witness
// vsize =weight/4

// 单个ins
// nonwitness = base + filevout
// witness = witnessBase + fileNsize*2

// initTx
// nonwitness = base + servicevout + filevout * filecount
// witness = witnessBase + file0size*2
// 278 = 174 + 52*2
// 384 = 174 + 52*2*2
// 489 = 174 + 52*2*3

// vsize
// 164 = 94+174/4+52*2/4
// 190 = 94+174/4+52*2*2/4
// 217 = 94+174/4+52*2*3/4

// 94+174/4 = 137.5 ~ 138

// 175+filesize/2+6
// 181+filesize/2
