const API_URL = 'https://mmo.ydev.tech/monster/current';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10分钟
let lastFetchTime = 0;

async function fetchMonsterData() {
    const CACHE_KEY = 'pokemmo_monster_data';
    const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存时间

    try {
        // 从响应数据中解析宝可梦和技能信息
        const extractedPokemonTypes = {};
        const extractedMoveNames = {};
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const cache = JSON.parse(cachedData);
            if (Date.now() - cache.timestamp < CACHE_DURATION) {
                console.log('使用缓存数据，剩余有效期：',
                    Math.floor((CACHE_DURATION - (Date.now() - cache.timestamp)) / 60000), '分钟');
                cache.data.forEach(item => {
                    const matches = item.text.match(/\[头目:(.*)\]\[梦特:(.*)\]\[(.*)\]\(/);
                    if (matches) {
                        const pokemonName = matches[1];
                        const ability = matches[2];
                        const moves = matches[3].split(',').map(move => move.trim());

                        // 更新 pokemonTypes
                        extractedPokemonTypes[item.monsterId] = {
                            name: pokemonName,
                            type: PokeTypes[item.monsterId],
                            img: `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${item.monsterId}.png`,
                            ability: ability
                        };

                        // 更新 moveNames
                        moves.forEach((move, index) => {
                            const moveId = item[`move${index + 1}Id`];
                            if (moveId) {
                                extractedMoveNames[moveId] = move;
                            }
                        });
                    }
                });
                Object.assign(pokemonTypes, extractedPokemonTypes);
                Object.assign(moveNames, extractedMoveNames);
                return cache.data;
            }
        }

        // 缓存不存在或已过期，从API获取新数据
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        data.forEach(item => {
            const matches = item.text.match(/\[头目:(.*)\]\[梦特:(.*)\]\[(.*)\]\(/);
            console.log(item.text)
            if (matches) {
                const pokemonName = matches[1];
                const ability = matches[2];
                const moves = matches[3].split(',').map(move => move.trim());

                // 更新 pokemonTypes
                extractedPokemonTypes[item.monsterId] = {
                    name: pokemonName,
                    type: PokeTypes[item.monsterId],
                    img: `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${item.monsterId}.png`,
                    ability: ability
                };

                // 更新 moveNames
                moves.forEach((move, index) => {
                    const moveId = item[`move${index + 1}Id`];
                    if (moveId) {
                        extractedMoveNames[moveId] = move;
                    }
                });
            }
        });
        Object.assign(pokemonTypes, extractedPokemonTypes);
        Object.assign(moveNames, extractedMoveNames);

        // 数据格式转换，确保与现有结构匹配
        const formattedData = data.map(item => ({
            ...item,
            // 确保时间相关字段为数字类型
            startHour: parseInt(item.startHour),
            startMinute: parseInt(item.startMinute),
            endHour: parseInt(item.endHour),
            endMinute: parseInt(item.endMinute),
            // 确保 ID 相关字段为数字类型
            monsterId: parseInt(item.monsterId),
            regionId: parseInt(item.regionId),
            move1Id: parseInt(item.move1Id),
            move2Id: parseInt(item.move2Id),
            move3Id: parseInt(item.move3Id),
            move4Id: parseInt(item.move4Id),
            alphaTimeId: parseInt(item.alphaTimeId)
        }));

        // 保存到缓存
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: formattedData
        }));
        return formattedData;
    } catch (error) {
        console.error('获取数据失败:', error);

        // 获取失败时，尝试使用过期的缓存数据
        const expiredCache = localStorage.getItem(CACHE_KEY);
        if (expiredCache) {
            console.warn('使用过期的缓存数据');
            return JSON.parse(expiredCache).data;
        }

        // 如果连过期数据都没有，使用默认数据
        return null;
    }
}

function shouldRefreshData() {
    const now = Date.now();
    return !lastFetchTime || (now - lastFetchTime) >= REFRESH_INTERVAL;
}

const regionNames = {
    0: "关都",
    1: "丰源",
    2: "合众",
    3: "神奥",
    4: "城都"
};

// 模拟数据加载 - 这里我们直接使用硬编码的数据
const monsterData = [];
// 宝可梦数据
const pokemonTypes = {};
// 技能数据
const moveNames = {};
const PokeTypes = {368: 'water', 366: 'water', 650: 'grass', 652: 'grass', 795: 'bug', 797: 'steel', 653: 'fire', 654: 'fire', 371: 'dragon', 798: 'grass', 649: 'bug', 796: 'electric', 372: 'dragon', 799: 'dark', 373: 'dragon', 369: 'water', 655: 'fire', 657: 'water', 800: 'psychic', 656: 'water', 375: 'steel', 659: 'normal', 370: 'water', 374: 'steel', 660: 'normal', 801: 'steel', 377: 'rock', 378: 'ice', 661: 'normal', 662: 'fire', 379: 'steel', 367: 'water', 663: 'fire', 802: 'fighting', 381: 'dragon', 803: 'poison', 664: 'bug', 806: 'fire', 804: 'poison', 383: 'ground', 666: 'bug', 376: 'steel', 807: 'electric', 667: 'fire', 808: 'steel', 382: 'water', 669: 'fairy', 805: 'rock', 385: 'steel', 810: 'grass', 380: 'dragon', 809: 'steel', 670: 'fairy', 794: 'bug', 811: 'grass', 812: 'grass', 389: 'grass', 672: 'grass', 390: 'fire', 673: 'grass', 665: 'bug', 674: 'fighting', 388: 'grass', 384: 'dragon', 387: 'grass', 815: 'fire', 671: 'fairy', 675: 'fighting', 816: 'water', 393: 'water', 392: 'fire', 394: 'water', 813: 'fire', 391: 'fire', 668: 'fire', 819: 'normal', 677: 'psychic', 678: 'psychic', 679: 'steel', 680: 'steel', 817: 'water', 398: 'normal', 821: 'flying', 818: 'water', 814: 'fire', 681: 'steel', 386: 'psychic', 396: 'normal', 820: 'normal', 822: 'flying', 399: 'normal', 683: 'fairy', 397: 'normal', 676: 'normal', 402: 'bug', 684: 'fairy', 826: 'bug', 682: 'fairy', 824: 'bug', 401: 'bug', 687: 'dark', 825: 'bug', 828: 'dark', 405: 'electric', 688: 'rock', 827: 'dark', 395: 'water', 829: 'grass', 403: 'electric', 830: 'grass', 831: 'normal', 407: 'grass', 408: 'rock', 823: 'flying', 690: 'poison', 686: 'dark', 409: 'rock', 685: 'fairy', 832: 'normal', 410: 'rock', 400: 'normal', 692: 'water', 691: 'poison', 411: 'rock', 689: 'rock', 406: 'grass', 412: 'bug', 834: 'water', 836: 'electric', 835: 'electric', 414: 'bug', 697: 'rock', 693: 'water', 694: 'electric', 415: 'bug', 839: 'rock', 698: 'rock', 413: 'bug', 837: 'rock', 695: 'electric', 699: 'rock', 840: 'grass', 417: 'electric', 700: 'fairy', 701: 'fighting', 841: 'grass', 842: 'grass', 419: 'water', 696: 'rock', 404: 'electric', 702: 'electric', 843: 'ground', 704: 'dragon', 703: 'rock', 705: 'dragon', 421: 'grass', 418: 'water', 846: 'water', 706: 'dragon', 844: 'ground', 833: 'water', 424: 'normal', 707: 'steel', 422: 'water', 838: 'rock', 849: 'electric', 708: 'ghost', 709: 'ghost', 850: 'fire', 423: 'water', 847: 'water', 851: 'fire', 416: 'bug', 426: 'ghost', 852: 'fighting', 845: 'flying', 420: 'grass', 429: 'ghost', 428: 'normal', 430: 'dark', 711: 'ghost', 713: 'ice', 431: 'normal', 714: 'flying', 848: 'electric', 712: 'ice', 427: 'normal', 425: 'ghost', 432: 'normal', 715: 'flying', 853: 'fighting', 717: 'dark', 854: 'ghost', 710: 'ghost', 857: 'psychic', 435: 'poison', 434: 'poison', 433: 'psychic', 718: 'dragon', 859: 'dark', 719: 'rock', 436: 'steel', 720: 'psychic', 1: 'grass', 437: 'steel', 861: 'dark', 438: 'rock', 4: 'fire', 855: 'ghost', 860: 'dark', 856: 'psychic', 862: 'dark', 5: 'fire', 2: 'grass', 721: 'fire', 716: 'fairy', 7: 'water', 6: 'fire', 722: 'grass', 441: 'normal', 858: 'psychic', 723: 'grass', 724: 'grass', 440: 'normal', 866: 'ice', 9: 'water', 442: 'ghost', 865: 'fighting', 443: 'dragon', 863: 'steel', 3: 'grass', 726: 'fire', 444: 'dragon', 10: 'bug', 11: 'bug', 8: 'water', 864: 'ghost', 725: 'fire', 446: 'normal', 12: 'bug', 439: 'psychic', 870: 'fighting', 13: 'bug', 867: 'ground', 729: 'water', 14: 'bug', 868: 'fairy', 872: 'ice', 869: 'fairy', 445: 'dragon', 15: 'bug', 727: 'fire', 873: 'ice', 449: 'ground', 730: 'water', 874: 'rock', 448: 'fighting', 731: 'normal', 451: 'poison', 728: 'water', 732: 'normal', 450: 'ground', 875: 'ice', 733: 'normal', 16: 'normal', 19: 'normal', 17: 'normal', 453: 'poison', 876: 'psychic', 871: 'electric', 736: 'bug', 21: 'normal', 455: 'grass', 737: 'bug', 877: 'electric', 454: 'poison', 18: 'normal', 452: 'poison', 734: 'normal', 879: 'steel', 880: 'electric', 456: 'water', 739: 'fighting', 22: 'normal', 738: 'bug', 23: 'poison', 881: 'electric', 20: 'normal', 882: 'water', 24: 'poison', 25: 'electric', 459: 'grass', 741: 'fire', 460: 'grass', 26: 'electric', 884: 'steel', 447: 'fighting', 742: 'bug', 735: 'normal', 740: 'fighting', 462: 'electric', 878: 'steel', 28: 'ground', 744: 'rock', 743: 'bug', 457: 'water', 745: 'rock', 885: 'dragon', 29: 'poison', 463: 'normal', 887: 'dragon', 458: 'water', 886: 'dragon', 883: 'water', 747: 'poison', 31: 'poison', 27: 'ground', 465: 'grass', 748: 'poison', 461: 'dark', 32: 'poison', 749: 'ground', 33: 'poison', 467: 'fire', 464: 'ground', 891: 'fighting', 750: 'ground', 746: 'water', 890: 'poison', 751: 'water', 35: 'fairy', 894: 'electric', 30: 'poison', 752: 'water', 889: 'fighting', 37: 'fire', 466: 'electric', 470: 'grass', 753: 'grass', 469: 'bug', 36: 'fairy', 34: 'poison', 472: 'ground', 897: 'ghost', 895: 'dragon', 471: 'ice', 468: 'fairy', 39: 'normal', 755: 'grass', 473: 'ice', 756: 'grass', 38: 'fire', 899: 'normal', 754: 'grass', 893: 'dark', 898: 'psychic', 888: 'fairy', 42: 'poison', 474: 'normal', 896: 'ice', 475: 'psychic', 901: 'ground', 758: 'poison', 476: 'rock', 757: 'poison', 40: 'normal', 759: 'normal', 477: 'ghost', 900: 'bug', 43: 'grass', 41: 'poison', 761: 'grass', 46: 'bug', 479: 'electric', 902: 'water', 903: 'fighting', 762: 'grass', 760: 'normal', 763: 'grass', 906: 'grass', 904: 'dark', 45: 'grass', 44: 'grass', 905: 'fairy', 49: 'bug', 48: 'bug', 478: 'ice', 764: 'fairy', 765: 'normal', 766: 'fighting', 50: 'ground', 909: 'fire', 907: 'grass', 47: 'bug', 767: 'bug', 51: 'ground', 910: 'fire', 768: 'bug', 481: 'psychic', 52: 'normal', 53: 'normal', 911: 'fire', 908: 'grass', 480: 'psychic', 769: 'ghost', 483: 'steel', 913: 'water', 54: 'water', 484: 'water', 55: 'water', 482: 'psychic', 56: 'fighting', 771: 'water', 912: 'water', 914: 'water', 57: 'fighting', 773: 'normal', 58: 'fire', 485: 'fire', 917: 'bug', 59: 'fire', 772: 'normal', 770: 'ghost', 775: 'normal', 774: 'rock', 60: 'water', 915: 'normal', 489: 'water', 487: 'ghost', 919: 'bug', 916: 'normal', 61: 'water', 486: 'normal', 62: 'water', 776: 'fire', 491: 'dark', 492: 'grass', 63: 'psychic', 920: 'bug', 488: 'psychic', 778: 'ghost', 64: 'psychic', 490: 'water', 923: 'electric', 780: 'normal', 918: 'bug', 922: 'electric', 65: 'psychic', 924: 'normal', 493: 'normal', 66: 'fighting', 782: 'dragon', 925: 'normal', 781: 'ghost', 496: 'grass', 67: 'fighting', 783: 'dragon', 921: 'electric', 777: 'electric', 68: 'fighting', 927: 'fairy', 497: 'grass', 495: 'grass', 785: 'electric', 784: 'dragon', 69: 'grass', 926: 'fairy', 779: 'water', 787: 'grass', 71: 'grass', 500: 'fire', 928: 'grass', 494: 'psychic', 70: 'grass', 501: 'water', 929: 'grass', 499: 'fire', 789: 'psychic', 932: 'rock', 503: 'water', 788: 'water', 931: 'normal', 74: 'rock', 72: 'water', 933: 'rock', 790: 'psychic', 502: 'water', 73: 'water', 934: 'rock', 504: 'normal', 505: 'normal', 786: 'psychic', 498: 'fire', 75: 'rock', 506: 'normal', 935: 'fire', 792: 'psychic', 791: 'psychic', 77: 'fire', 78: 'fire', 930: 'grass', 76: 'rock', 936: 'fire', 507: 'normal', 224: 'water', 80: 'water', 939: 'electric', 937: 'fire', 509: 'dark', 226: 'water', 510: 'dark', 79: 'water', 82: 'electric', 222: 'water', 941: 'electric', 227: 'steel', 940: 'electric', 83: 'normal', 223: 'water', 84: 'normal', 229: 'dark', 513: 'fire', 943: 'dark', 228: 'dark', 81: 'electric', 942: 'dark', 85: 'normal', 514: 'fire', 230: 'water', 944: 'poison', 86: 'water', 945: 'poison', 938: 'electric', 511: 'grass', 516: 'water', 87: 'water', 232: 'ground', 233: 'normal', 225: 'ice', 515: 'water', 89: 'poison', 946: 'grass', 947: 'grass', 518: 'psychic', 517: 'psychic', 512: 'grass', 88: 'poison', 508: 'normal', 235: 'normal', 91: 'water', 236: 'fighting', 90: 'water', 231: 'ground', 92: 'ghost', 237: 'fighting', 950: 'rock', 522: 'electric', 948: 'ground', 952: 'grass', 94: 'ghost', 234: 'normal', 93: 'ghost', 523: 'electric', 238: 'ice', 239: 'electric', 524: 'rock', 240: 'fire', 954: 'bug', 520: 'normal', 521: 'normal', 96: 'psychic', 953: 'bug', 95: 'rock', 949: 'ground', 526: 'rock', 242: 'normal', 97: 'psychic', 525: 'rock', 243: 'electric', 527: 'psychic', 519: 'normal', 528: 'psychic', 951: 'grass', 98: 'water', 99: 'water', 955: 'psychic', 244: 'fire', 958: 'fairy', 245: 'water', 101: 'electric', 246: 'rock', 100: 'electric', 957: 'fairy', 959: 'fairy', 531: 'normal', 247: 'rock', 102: 'grass', 248: 'rock', 962: 'flying', 529: 'ground', 956: 'psychic', 960: 'water', 963: 'water', 104: 'ground', 533: 'fighting', 241: 'normal', 534: 'fighting', 961: 'water', 964: 'water', 250: 'fire', 530: 'ground', 965: 'steel', 251: 'psychic', 536: 'water', 105: 'ground', 108: 'normal', 106: 'fighting', 537: 'water', 107: 'fighting', 966: 'steel', 109: 'poison', 252: 'grass', 249: 'psychic', 254: 'grass', 968: 'steel', 969: 'rock', 532: 'fighting', 110: 'poison', 535: 'water', 540: 'bug', 256: 'fire', 111: 'ground', 541: 'bug', 538: 'fighting', 539: 'fighting', 257: 'fire', 255: 'fire', 112: 'ground', 970: 'rock', 113: 'normal', 259: 'water', 258: 'water', 971: 'ghost', 253: 'grass', 260: 'water', 967: 'dragon', 974: 'ice', 114: 'grass', 116: 'water', 543: 'bug', 972: 'ghost', 103: 'grass', 117: 'water', 262: 'dark', 115: 'normal', 542: 'bug', 545: 'bug', 263: 'normal', 975: 'ice', 977: 'water', 261: 'dark', 976: 'water', 978: 'dragon', 973: 'flying', 119: 'water', 264: 'normal', 548: 'grass', 544: 'bug', 118: 'water', 547: 'grass', 120: 'water', 267: 'bug', 550: 'water', 122: 'psychic', 980: 'poison', 121: 'water', 266: 'bug', 982: 'normal', 546: 'grass', 551: 'ground', 981: 'normal', 553: 'ground', 124: 'ice', 123: 'bug', 268: 'bug', 265: 'bug', 984: 'ground', 270: 'water', 126: 'fire', 549: 'grass', 985: 'fairy', 555: 'fire', 979: 'fighting', 271: 'water', 986: 'grass', 269: 'bug', 125: 'electric', 127: 'bug', 128: 'normal', 554: 'fire', 129: 'water', 552: 'ground', 557: 'bug', 274: 'grass', 988: 'bug', 556: 'grass', 275: 'grass', 983: 'dark', 276: 'normal', 558: 'bug', 560: 'dark', 277: 'normal', 131: 'water', 132: 'normal', 989: 'electric', 559: 'dark', 562: 'ghost', 130: 'water', 987: 'ghost', 992: 'fighting', 272: 'water', 134: 'water', 273: 'grass', 563: 'ghost', 991: 'ice', 278: 'water', 990: 'ground', 135: 'electric', 994: 'fire', 995: 'rock', 136: 'fire', 279: 'water', 280: 'psychic', 993: 'dark', 561: 'psychic', 996: 'dragon', 133: 'normal', 567: 'rock', 138: 'rock', 139: 'rock', 566: 'rock', 283: 'bug', 281: 'psychic', 137: 'normal', 569: 'poison', 997: 'dragon', 140: 'rock', 999: 'ghost', 285: 'grass', 565: 'water', 1000: 'steel', 142: 'rock', 571: 'dark', 284: 'bug', 282: 'psychic', 286: 'grass', 998: 'dragon', 564: 'water', 287: 'normal', 1001: 'dark', 568: 'poison', 143: 'normal', 570: 'dark', 288: 'normal', 573: 'normal', 145: 'electric', 574: 'psychic', 289: 'normal', 1002: 'dark', 290: 'bug', 572: 'normal', 146: 'fire', 1005: 'dragon', 141: 'rock', 1004: 'dark', 147: 'dragon', 576: 'psychic', 291: 'bug', 292: 'bug', 577: 'psychic', 144: 'ice', 578: 'psychic', 1007: 'fighting', 149: 'dragon', 148: 'dragon', 1006: 'fairy', 1009: 'water', 150: 'psychic', 579: 'psychic', 1010: 'grass', 1003: 'dark', 293: 'normal', 151: 'psychic', 1011: 'grass', 296: 'fighting', 575: 'psychic', 582: 'ice', 153: 'grass', 295: 'normal', 1012: 'grass', 297: 'fighting', 581: 'water', 294: 'normal', 583: 'ice', 1013: 'grass', 298: 'normal', 152: 'grass', 585: 'normal', 156: 'fire', 300: 'normal', 580: 'water', 1015: 'poison', 157: 'fire', 1008: 'electric', 301: 'normal', 154: 'grass', 584: 'ice', 302: 'dark', 158: 'water', 155: 'fire', 1017: 'grass', 588: 'bug', 303: 'steel', 160: 'water', 589: 'bug', 586: 'normal', 1018: 'steel', 1014: 'poison', 161: 'normal', 587: 'electric', 305: 'steel', 1020: 'fire', 590: 'grass', 304: 'steel', 163: 'normal', 306: 'steel', 159: 'water', 307: 'fighting', 1016: 'poison', 1022: 'rock', 591: 'grass', 1023: 'steel', 164: 'normal', 592: 'water', 1019: 'grass', 594: 'water', 593: 'water', 309: 'electric', 299: 'rock', 310: 'electric', 165: 'bug', 1021: 'electric', 311: 'electric', 308: 'fighting', 166: 'bug', 168: 'bug', 312: 'electric', 597: 'grass', 169: 'poison', 596: 'bug', 314: 'bug', 1025: 'poison', 167: 'bug', 171: 'water', 599: 'steel', 162: 'normal', 315: 'grass', 598: 'grass', 313: 'bug', 170: 'water', 595: 'bug', 317: 'poison', 316: 'poison', 173: 'fairy', 318: 'water', 174: 'normal', 600: 'steel', 319: 'water', 1024: 'normal', 172: 'electric', 604: 'electric', 176: 'fairy', 175: 'fairy', 602: 'electric', 605: 'psychic', 606: 'psychic', 321: 'water', 178: 'psychic', 601: 'steel', 177: 'psychic', 603: 'electric', 323: 'fire', 324: 'fire', 179: 'electric', 181: 'electric', 608: 'ghost', 607: 'ghost', 182: 'grass', 326: 'psychic', 611: 'dragon', 322: 'fire', 612: 'dragon', 609: 'ghost', 327: 'normal', 183: 'water', 325: 'psychic', 613: 'ice', 184: 'water', 180: 'electric', 329: 'ground', 186: 'water', 330: 'ground', 187: 'grass', 616: 'bug', 188: 'grass', 331: 'grass', 332: 'grass', 617: 'bug', 328: 'ground', 333: 'normal', 618: 'ground', 619: 'fighting', 191: 'grass', 610: 'dragon', 620: 'fighting', 189: 'grass', 615: 'ice', 192: 'grass', 320: 'water', 336: 'poison', 190: 'normal', 334: 'dragon', 194: 'water', 185: 'rock', 338: 'rock', 621: 'dragon', 195: 'water', 339: 'water', 624: 'dark', 196: 'psychic', 622: 'ground', 340: 'water', 341: 'water', 197: 'dark', 342: 'water', 614: 'ice', 627: 'normal', 628: 'normal', 198: 'dark', 199: 'water', 629: 'dark', 201: 'psychic', 193: 'bug', 344: 'ground', 343: 'ground', 337: 'rock', 623: 'ground', 630: 'dark', 202: 'psychic', 631: 'fire', 347: 'rock', 203: 'normal', 204: 'bug', 625: 'dark', 335: 'normal', 633: 'dark', 205: 'bug', 346: 'rock', 634: 'dark', 350: 'water', 632: 'bug', 351: 'normal', 636: 'bug', 200: 'ghost', 207: 'ground', 626: 'normal', 345: 'rock', 209: 'fairy', 208: 'steel', 349: 'water', 210: 'fairy', 635: 'dark', 352: 'normal', 354: 'ghost', 211: 'water', 640: 'grass', 206: 'normal', 641: 'flying', 637: 'bug', 639: 'rock', 357: 'grass', 348: 'rock', 638: 'steel', 214: 'bug', 353: 'ghost', 642: 'electric', 356: 'ghost', 644: 'dragon', 216: 'normal', 645: 'ground', 643: 'dragon', 358: 'psychic', 215: 'dark', 217: 'normal', 218: 'fire', 646: 'dragon', 361: 'ice', 362: 'ice', 213: 'bug', 355: 'ghost', 219: 'fire', 364: 'ice', 220: 'ice', 221: 'ice', 647: 'water', 365: 'ice', 648: 'normal', 212: 'bug', 363: 'ice', 359: 'dark', 360: 'psychic'};


// 时段名称
const alphaTimeNames = {
    1: "清晨", // 5:00-8:59
    2: "上午", // 9:00-11:59
    3: "中午", // 12:00-13:59
    4: "下午", // 14:00-16:59
    5: "傍晚", // 17:00-19:59
    6: "晚上", // 20:00-22:59
    7: "深夜"  // 23:00-4:59
};

// 添加时间段判断函数
function getAlphaTimeId(hour) {
    if (hour >= 5 && hour < 9) return 1;
    if (hour >= 9 && hour < 12) return 2;
    if (hour >= 12 && hour < 14) return 3;
    if (hour >= 14 && hour < 17) return 4;
    if (hour >= 17 && hour < 20) return 5;
    if (hour >= 20 && hour < 23) return 6;
    return 7; // 23:00-4:59
}

// 格式化时间
function formatTime(hour, minute) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// 获取持续时间（分钟）
function getDuration(startHour, startMinute, endHour, endMinute) {
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    return endTotal - startTotal;
}

// 计算剩余时间
function getRemainingTime(endHour, endMinute) {
    const now = new Date();
    const end = new Date();
    end.setHours(endHour, endMinute, 0);

    if (end < now) {
        return {text: "已结束", status: "ended"};
    }

    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let statusClass = "active";
    if (diff < 15 * 60 * 1000) { // 少于15分钟
        statusClass = "urgent";
    }

    return {
        text: `剩余 ${hours}小时 ${minutes}分钟`,
        status: statusClass
    };
}

// 检查是否活跃
function isActive(endHour, endMinute) {
    const now = new Date();
    const end = new Date();
    end.setHours(endHour, endMinute, 0);
    return end > now;
}

// 更新统计数据
function updateStats(monsters) {
    const activeCount = monsters.filter(m =>
        isActive(m.endHour, m.endMinute)
    ).length;
    document.getElementById('active-count').textContent = activeCount;
    document.getElementById('total-count').textContent = monsters.length;
    const locations = {};
    monsters.forEach(m => {
        const region = regionNames[m.regionId] || "未知地区";
        locations[`${region} ${m.locationName}`] = (locations[m.locationName] || 0) + 1;
    });

    const commonLocation = Object.keys(locations).sort((a, b) =>
        locations[b] - locations[a]
    )[0] || "无数据";

    document.getElementById('common-location').textContent = commonLocation;
}

// 渲染宝可梦卡片
function renderMonsterCards(monsters) {
    const container = document.getElementById("monster-container");

    if (!monsters || monsters.length === 0) {
        container.innerHTML = '<div class="no-data">暂无报点数据</div>';
        return;
    }

    container.innerHTML = monsters.map(monster => {
        const pokemon = pokemonTypes[monster.monsterId] || {
            name: `未知宝可梦(#${monster.monsterId})`,
            type: "normal",
            img: "",
            ability: "未知"
        };
        const startTime = formatTime(monster.startHour, monster.startMinute);
        const endTime = formatTime(monster.endHour, monster.endMinute);
        const duration = getDuration(monster.startHour, monster.startMinute, monster.endHour, monster.endMinute);
        const remaining = getRemainingTime(monster.endHour, monster.endMinute);
        const regionName = regionNames[monster.regionId] || "未知地区";

        // 确定状态类和图标
        let statusClass = "active";
        let statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        let statusColor = "#2ecc71";

        if (remaining.status === "ended") {
            statusClass = "ended";
            statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            statusColor = "#e74c3c";
        } else if (remaining.status === "urgent") {
            statusClass = "urgent";
            statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            statusColor = "#f39c12";
        }

        return `
        <div class="monster-card">
            <div class="monster-header type-${pokemon.type}">
                <div class="monster-img">
                    <img src="${pokemon.img}" alt="${pokemon.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                </div>
                <div class="monster-info">
                    <div class="monster-name">${pokemon.name}</div>
                    <div class="monster-location">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${monster.locationName}
                        </span>
                        <span class="region-badge">${regionName}</span>
                    </div>
                </div>
                <div class="monster-time">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${startTime} - ${endTime}
                </div>
            </div>

          <div class="monster-details">
            <div class="monster-status" style="background-color: ${statusColor}20; border-left-color: ${statusColor};">
              <div class="status-icon" style="color: ${statusColor};">
                ${statusIcon}
              </div>
              <div class="status-text">${remaining.text}</div>
            </div>

            <div class="monster-meta">
              <div class="monster-meta-item">
                <div class="monster-meta-label">持续时间</div>
                <div class="monster-meta-value">${duration}分钟</div>
              </div>
              <div class="monster-meta-item">
                <div class="monster-meta-label">时段</div>
                <div class="monster-meta-value">${alphaTimeNames[getAlphaTimeId(monster.endHour)] || "未知"}</div>
              </div>
              <div class="monster-meta-item">
                <div class="monster-meta-label">特性</div>
                <div class="monster-meta-value">${pokemon.ability}</div>
              </div>
            </div>

            <div class="monster-moves">
              <div class="monster-moves-title">技能列表</div>
              <div class="move-grid">
                <div class="move-item">${moveNames[monster.move1Id] || `技能#${monster.move1Id}`}</div>
                <div class="move-item">${moveNames[monster.move2Id] || `技能#${monster.move2Id}`}</div>
                <div class="move-item">${moveNames[monster.move3Id] || `技能#${monster.move3Id}`}</div>
                <div class="move-item">${moveNames[monster.move4Id] || `技能#${monster.move4Id}`}</div>
              </div>
            </div>
          </div>

          <div class="monster-footer">
            <div class="time-badge" style="
                background: linear-gradient(135deg, #3a5dd9, #00b4d8);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">${monster.date}</div>
            <div class="reporter">
                <div class="reporter-avatar">
                    <img src="${monster.itemCosmeticConfigUrl}" alt="${monster.userIgn}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 50%;
                    ">
                </div>
                <div class="reported-by">报点人: ${monster.userIgn}</div>
            </div>
        </div>
        </div>
      `;
    }).join('');
}

// 渲染时间分布图表
function renderTimeDistributionChart(monsters) {
    const ctx = document.getElementById('timeDistributionChart').getContext('2d');

    // 修改标签显示，加入地区信息
    const labels = monsters.map(m => {
        const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
        return pokemon.name;
    });

    const startTimes = monsters.map(m => m.startHour * 60 + m.startMinute);

    // 创建图表
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '出现时间 (分钟)',
                data: startTimes,
                backgroundColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 0.7);
                }),
                borderColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 1);
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24 * 60,
                    ticks: {
                        callback: function (value) {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return formatTime(hours, minutes);
                        },
                        stepSize: 120
                    },
                    title: {
                        display: true,
                        text: '出现时间'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '宝可梦'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const index = context[0].dataIndex;
                            const m = monsters[index];
                            const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
                            const region = regionNames[m.regionId] || "未知地区";
                            return `${pokemon.name} (${region}-${m.locationName})`;
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return `出现时间: ${formatTime(hours, minutes)}`;
                        },
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            const m = monsters[index];
                            const endTime = formatTime(m.endHour, m.endMinute);
                            const duration = getDuration(m.startHour, m.startMinute, m.endHour, m.endMinute);
                            return [
                                `结束时间: ${endTime}`,
                                `持续时间: ${duration}分钟`,
                                `报点人: ${m.userIgn}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// 渲染持续时间图表
function renderDurationChart(monsters) {
    const ctx = document.getElementById('durationChart').getContext('2d');

    // 提取数据
    const durations = monsters.map(m => {
        return getDuration(m.startHour, m.startMinute, m.endHour, m.endMinute);
    });

    // 修改标签显示，加入地区信息
    const labels = monsters.map(m => {
        const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
        return pokemon.name;
    });

    // 创建图表 - 修复horizontalBar的问题，使用bar类型并设置indexAxis为'y'
    new Chart(ctx, {
        type: 'bar', // 改用标准bar类型
        data: {
            labels: labels,
            datasets: [{
                label: '持续时间 (分钟)',
                data: durations,
                backgroundColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 0.7);
                }),
                borderColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 1);
                }),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // 水平方向的条形图
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '持续时间 (分钟)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '宝可梦'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `持续时间: ${context.parsed.x} 分钟`;
                        },
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            const m = monsters[index];
                            const startTime = formatTime(m.startHour, m.startMinute);
                            const endTime = formatTime(m.endHour, m.endMinute);
                            return [
                                `时间段: ${startTime} - ${endTime}`,
                                `报点人: ${m.userIgn}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// 更新计时器状态
function updateTimerStatus(monsters) {
    const now = new Date();
    const container = document.getElementById('timer-status');

    // 查找当前正在进行的事件
    const activeMonsters = monsters.filter(m => {
        const end = new Date();
        end.setHours(m.endHour, m.endMinute, 0);
        return end > now;
    });

    if (activeMonsters.length === 0) {
        container.innerHTML = `
    <div class="timer-icon" style="background-color: #e74c3c;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div class="timer-info">
      <div class="timer-title">当前没有进行中的头目</div>
      <div class="timer-subtitle">最近的报点已经结束，请等待新的报点信息</div>
    </div>
  `;
        // 修改边框颜色
        container.style.borderLeftColor = "#e74c3c";
        return;
    }

    // 按结束时间排序，获取最快结束的事件
    activeMonsters.sort((a, b) => {
        const endA = a.endHour * 60 + a.endMinute;
        const endB = b.endHour * 60 + b.endMinute;
        return endA - endB;
    });

    const nextEnd = activeMonsters[0];
    const pokemon = pokemonTypes[nextEnd.monsterId] || {name: `未知宝可梦(#${nextEnd.monsterId})`};
    const region = regionNames[nextEnd.regionId] || "未知地区";
    const remaining = getRemainingTime(nextEnd.endHour, nextEnd.endMinute);
    const startTime = formatTime(nextEnd.startHour, nextEnd.startMinute);
    const endTime = formatTime(nextEnd.endHour, nextEnd.endMinute);

    let timerColor = "#2ecc71";
    let statusIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">
            <circle cx="12" cy="12" r="8"/>
            <path d="M12 8v4l3 1.5"/>
        </svg>`;
    if (remaining.status === "urgent") {
        timerColor = "#f39c12";
        statusIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">
                <path d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`;
    }

    container.innerHTML = `
        <div class="timer-icon" style="background: linear-gradient(135deg, ${timerColor}, ${timerColor}dd); box-shadow: 0 3px 10px ${timerColor}40;">
            ${statusIcon}
        </div>
        <div class="timer-info">
            <div class="timer-title" style="font-size: 1.25rem; margin-bottom: 8px;">
                <span style="color: ${timerColor}; font-weight: bold; text-shadow: 0 1px 2px ${timerColor}20;">${pokemon.name}</span>
                正在
                <span style="color: ${timerColor}; font-weight: bold; text-shadow: 0 1px 2px ${timerColor}20;">${region}-${nextEnd.locationName}</span>
                出现！
            </div>
            <div class="timer-subtitle" style="display: flex; flex-direction: column; gap: 6px; opacity: 0.9;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${timerColor};">⏰</span>
                    出现时间：${startTime} - ${endTime}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; color: ${timerColor}; font-weight: 600;">
                    <span>⚠️</span>
                    ${remaining.text}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${timerColor};">👤</span>
                    报点人：${nextEnd.userIgn}
                </div>
            </div>
        </div>
    `;

    // 修改容器样式
    container.style.borderLeftColor = timerColor;
    container.style.borderLeftWidth = "5px";
    container.style.background = `linear-gradient(to right, ${timerColor}08, white)`;
    container.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
}

// 获取宝可梦类型颜色
function getTypeColor(type, alpha = 1) {
    const colors = {
        normal: `rgba(168, 168, 120, ${alpha})`,
        fire: `rgba(240, 128, 48, ${alpha})`,
        water: `rgba(104, 144, 240,${alpha})`,
        grass: `rgba(120, 200, 80, ${alpha})`,
        electric: `rgba(248, 208, 48, ${alpha})`,
        ice: `rgba(152, 216, 216, ${alpha})`,
        fighting: `rgba(192, 48, 40, ${alpha})`,
        poison: `rgba(160, 64, 160, ${alpha})`,
        ground: `rgba(224, 192, 104, ${alpha})`,
        flying: `rgba(168, 144, 240, ${alpha})`,
        psychic: `rgba(248, 88, 136, ${alpha})`,
        bug: `rgba(168, 184, 32, ${alpha})`,
        rock: `rgba(184, 160, 56, ${alpha})`,
        ghost: `rgba(112, 88, 152, ${alpha})`,
        dragon: `rgba(112, 56, 248, ${alpha})`,
        dark: `rgba(112, 88, 72, ${alpha})`,
        steel: `rgba(184, 184, 208, ${alpha})`,
        fairy: `rgba(238, 153, 172, ${alpha})`
    };

    return colors[type] || `rgba(100, 100, 100, ${alpha})`;
}

// 修改初始化函数
async function initializePage() {
    try {
        let data = await fetchMonsterData();

        // 如果请求失败，使用默认数据
        if (!data || data.length === 0) {
            console.log('使用默认数据');
            data = monsterData;
        }

        // 清除之前的图表实例（如果存在）
        const timeChartInstance = Chart.getChart('timeDistributionChart');
        const durationChartInstance = Chart.getChart('durationChart');
        if (timeChartInstance) timeChartInstance.destroy();
        if (durationChartInstance) durationChartInstance.destroy();

        // 更新所有视图
        renderMonsterCards(data);
        renderTimeDistributionChart(data);
        renderDurationChart(data);
        updateTimerStatus(data);
        updateStats(data);

    } catch (error) {
        console.error('初始化失败:', error);
        // 出错时使用默认数据
        renderMonsterCards(monsterData);
        renderTimeDistributionChart(monsterData);
        renderDurationChart(monsterData);
        updateTimerStatus(monsterData);
        updateStats(monsterData);
    }
}

// 修改定时刷新逻辑
let refreshInterval;

function startRefreshInterval() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(async () => {
        const data = await fetchMonsterData();
        if (data) {
            // 清除之前的图表实例
            const timeChartInstance = Chart.getChart('timeDistributionChart');
            const durationChartInstance = Chart.getChart('durationChart');
            if (timeChartInstance) timeChartInstance.destroy();
            if (durationChartInstance) durationChartInstance.destroy();

            // 更新所有视图
            updateTimerStatus(data);
            renderMonsterCards(data);
            renderTimeDistributionChart(data);
            renderDurationChart(data);
            updateStats(data);
        }
    }, 60000); // 每分钟检查一次，但实际刷新由缓存机制控制
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    startRefreshInterval();
    const githubLink = document.querySelector('.developer-link');
    githubLink.addEventListener('click', function(e) {
        e.preventDefault(); // 阻止默认行为
        const newWindow = window.open(this.href, '_blank');
        if (newWindow === null) {
            window.location.href = this.href;
        }
    });
});

// 页面隐藏时停止刷新，显示时恢复刷新
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    } else {
        initializePage();
        startRefreshInterval();
    }
});
