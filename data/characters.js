const historicalCharacters = [
    {
        id: "char_001",
        name: "秦始皇",
        title: "秦朝开国皇帝",
        birth: "公元前259年",
        death: "公元前210年",
        description: "中国历史上著名的政治家、战略家、改革家，首位完成中国大一统的政治人物，被称为千古一帝",
        category: "political",
        achievements: [
            "统一六国，建立中国历史上第一个统一的多民族国家",
            "实行郡县制，加强中央集权",
            "统一文字、度量衡和货币",
            "修筑长城，抵御匈奴",
            "修建灵渠，沟通水系"
        ],
        relatedEvents: ["event_001"]
    },
    {
        id: "char_002",
        name: "李斯",
        title: "秦朝丞相",
        birth: "公元前284年",
        death: "公元前208年",
        description: "秦朝著名的政治家、文学家和书法家，协助秦始皇统一六国",
        category: "political",
        achievements: [
            "协助秦始皇统一六国",
            "推行郡县制",
            "统一文字，废除六国文字",
            "制定秦朝法律制度"
        ],
        relatedEvents: ["event_001"]
    },
    {
        id: "char_003",
        name: "刘邦",
        title: "汉高祖",
        birth: "公元前256年",
        death: "公元前195年",
        description: "汉朝开国皇帝，中国历史上第一位平民出身的皇帝",
        category: "political",
        achievements: [
            "推翻秦朝统治",
            "建立汉朝，开创汉朝基业",
            "击败项羽，统一天下",
            "实行休养生息政策"
        ],
        relatedEvents: ["event_002", "event_003"]
    },
    {
        id: "char_004",
        name: "项羽",
        title: "西楚霸王",
        birth: "公元前232年",
        death: "公元前202年",
        description: "秦末农民起义军领袖，中国历史上最勇猛的武将之一",
        category: "military",
        achievements: [
            "巨鹿之战大破秦军主力",
            "推翻秦朝统治",
            "建立西楚政权"
        ],
        relatedEvents: ["event_002"]
    },
    {
        id: "char_005",
        name: "张骞",
        title: "汉朝外交家",
        birth: "公元前164年",
        death: "公元前114年",
        description: "汉朝杰出的外交家、探险家，丝绸之路的开拓者",
        category: "political",
        achievements: [
            "两次出使西域，开辟丝绸之路",
            "促进东西方文化交流",
            "引进西域的葡萄、苜蓿等作物"
        ],
        relatedEvents: ["event_004"]
    },
    {
        id: "char_006",
        name: "汉武帝",
        title: "汉朝皇帝",
        birth: "公元前156年",
        death: "公元前87年",
        description: "汉朝第七位皇帝，开创了汉朝的鼎盛时期",
        category: "political",
        achievements: [
            "派遣张骞出使西域，开辟丝绸之路",
            "击败匈奴，扩大疆域",
            "推行罢黜百家，独尊儒术",
            "建立太学，培养人才"
        ],
        relatedEvents: ["event_004"]
    },
    {
        id: "char_007",
        name: "曹操",
        title: "魏武帝",
        birth: "公元155年",
        death: "公元220年",
        description: "东汉末年著名的政治家、军事家、文学家，曹魏政权的奠基人",
        category: "political",
        achievements: [
            "统一中国北方",
            "推行屯田制，恢复农业生产",
            "唯才是举，选拔人才",
            "文学成就，建安风骨代表"
        ],
        relatedEvents: ["event_005"]
    },
    {
        id: "char_008",
        name: "刘备",
        title: "汉昭烈帝",
        birth: "公元161年",
        death: "公元223年",
        description: "三国时期蜀汉开国皇帝，以仁德著称",
        category: "political",
        achievements: [
            "建立蜀汉政权",
            "三顾茅庐，请诸葛亮出山",
            "联吴抗曹，取得赤壁之战胜利"
        ],
        relatedEvents: ["event_005"]
    },
    {
        id: "char_009",
        name: "孙权",
        title: "吴大帝",
        birth: "公元182年",
        death: "公元252年",
        description: "三国时期东吴开国皇帝",
        category: "political",
        achievements: [
            "建立东吴政权",
            "开发江南地区",
            "派遣船队到达夷洲（台湾）"
        ],
        relatedEvents: ["event_005"]
    },
    {
        id: "char_010",
        name: "曹丕",
        title: "魏文帝",
        birth: "公元187年",
        death: "公元226年",
        description: "曹魏开国皇帝，曹操长子",
        category: "political",
        achievements: [
            "废汉献帝，建立魏国",
            "推行九品中正制",
            "文学成就，与曹操、曹植并称三曹"
        ],
        relatedEvents: ["event_006"]
    },
    {
        id: "char_011",
        name: "司马炎",
        title: "晋武帝",
        birth: "公元236年",
        death: "公元290年",
        description: "西晋开国皇帝，晋朝建立者",
        category: "political",
        achievements: [
            "废魏帝，建立晋朝",
            "灭吴，统一全国",
            "推行占田制，恢复经济"
        ],
        relatedEvents: ["event_007", "event_008"]
    },
    {
        id: "char_012",
        name: "司马睿",
        title: "晋元帝",
        birth: "公元276年",
        death: "公元323年",
        description: "东晋开国皇帝",
        category: "political",
        achievements: [
            "在建康建立东晋",
            "稳定江南局势",
            "推行侨置政策"
        ],
        relatedEvents: ["event_009"]
    },
    {
        id: "char_013",
        name: "刘裕",
        title: "宋武帝",
        birth: "公元363年",
        death: "公元422年",
        description: "刘宋开国皇帝，南朝刘宋建立者",
        category: "political",
        achievements: [
            "废晋恭帝，建立宋朝",
            "北伐收复失地",
            "整顿吏治，加强中央集权"
        ],
        relatedEvents: ["event_010"]
    },
    {
        id: "char_014",
        name: "杨坚",
        title: "隋文帝",
        birth: "公元541年",
        death: "公元604年",
        description: "隋朝开国皇帝，结束了南北朝分裂局面",
        category: "political",
        achievements: [
            "建立隋朝，统一全国",
            "推行三省六部制",
            "开创科举制度",
            "修建大运河"
        ],
        relatedEvents: ["event_011"]
    },
    {
        id: "char_015",
        name: "隋炀帝",
        title: "隋朝皇帝",
        birth: "公元569年",
        death: "公元618年",
        description: "隋朝第二位皇帝",
        category: "political",
        achievements: [
            "开凿大运河，连接南北水路",
            "修建东都洛阳",
            "开创进士科"
        ],
        relatedEvents: ["event_012"]
    },
    {
        id: "char_016",
        name: "李渊",
        title: "唐高祖",
        birth: "公元566年",
        death: "公元635年",
        description: "唐朝开国皇帝",
        category: "political",
        achievements: [
            "建立唐朝",
            "统一全国",
            "开创唐朝基业"
        ],
        relatedEvents: ["event_013"]
    },
    {
        id: "char_017",
        name: "李世民",
        title: "唐太宗",
        birth: "公元598年",
        death: "公元649年",
        description: "唐朝第二位皇帝，开创了贞观之治",
        category: "political",
        achievements: [
            "发动玄武门之变，夺取皇位",
            "开创贞观之治",
            "虚心纳谏，任用贤能",
            "击败突厥，被尊为天可汗"
        ],
        relatedEvents: ["event_014"]
    },
    {
        id: "char_018",
        name: "玄奘",
        title: "唐朝高僧",
        birth: "公元602年",
        death: "公元664年",
        description: "唐朝著名高僧，翻译家，旅行家",
        category: "philosopher",
        achievements: [
            "西行取经，历时17年",
            "翻译大量佛经",
            "撰写《大唐西域记》",
            "促进中印文化交流"
        ],
        relatedEvents: ["event_015"]
    },
    {
        id: "char_019",
        name: "武则天",
        title: "中国唯一女皇帝",
        birth: "公元624年",
        death: "公元705年",
        description: "中国历史上唯一的女皇帝",
        category: "political",
        achievements: [
            "成为中国历史上唯一的女皇帝",
            "开创武周政权",
            "发展科举制度",
            "重视农业发展"
        ],
        relatedEvents: ["event_016"]
    },
    {
        id: "char_020",
        name: "安禄山",
        title: "唐朝叛将",
        birth: "公元703年",
        death: "公元757年",
        description: "唐朝节度使，安史之乱发动者",
        category: "military",
        achievements: [],
        relatedEvents: ["event_017"]
    },
    {
        id: "char_021",
        name: "史思明",
        title: "唐朝叛将",
        birth: "公元703年",
        death: "公元761年",
        description: "唐朝节度使，安史之乱发动者",
        category: "military",
        achievements: [],
        relatedEvents: ["event_017"]
    },
    {
        id: "char_022",
        name: "朱温",
        title: "后梁太祖",
        birth: "公元852年",
        death: "公元912年",
        description: "后梁开国皇帝，唐朝灭亡的直接推动者",
        category: "political",
        achievements: [
            "废唐哀帝，建立后梁",
            "结束唐朝统治"
        ],
        relatedEvents: ["event_018"]
    },
    {
        id: "char_023",
        name: "赵匡胤",
        title: "宋太祖",
        birth: "公元927年",
        death: "公元976年",
        description: "宋朝开国皇帝",
        category: "political",
        achievements: [
            "陈桥兵变，黄袍加身",
            "建立宋朝，结束五代十国分裂",
            "杯酒释兵权，加强中央集权"
        ],
        relatedEvents: ["event_019"]
    },
    {
        id: "char_024",
        name: "毕昇",
        title: "北宋发明家",
        birth: "公元970年",
        death: "公元1051年",
        description: "北宋发明家，活字印刷术的发明者",
        category: "scientist",
        achievements: [
            "发明活字印刷术",
            "大大提高了印刷效率",
            "促进了文化传播"
        ],
        relatedEvents: ["event_020"]
    },
    {
        id: "char_025",
        name: "宋徽宗",
        title: "宋朝皇帝",
        birth: "公元1082年",
        death: "公元1135年",
        description: "宋朝第八位皇帝，著名的书画家",
        category: "literary",
        achievements: [
            "书画成就，创瘦金体",
            "建立画院，发展艺术"
        ],
        relatedEvents: ["event_021"]
    },
    {
        id: "char_026",
        name: "宋钦宗",
        title: "宋朝皇帝",
        birth: "公元1100年",
        death: "公元1156年",
        description: "宋朝第九位皇帝",
        category: "political",
        achievements: [],
        relatedEvents: ["event_021"]
    },
    {
        id: "char_027",
        name: "赵构",
        title: "宋高祖",
        birth: "公元1107年",
        death: "公元1187年",
        description: "南宋开国皇帝",
        category: "political",
        achievements: [
            "在临安建立南宋",
            "稳定南宋政权"
        ],
        relatedEvents: ["event_022"]
    },
    {
        id: "char_028",
        name: "成吉思汗",
        title: "蒙古帝国大汗",
        birth: "公元1162年",
        death: "公元1227年",
        description: "蒙古帝国奠基者，世界历史上杰出的军事统帅",
        category: "military",
        achievements: [
            "统一蒙古各部",
            "建立蒙古帝国",
            "征服欧亚大陆广大地区"
        ],
        relatedEvents: ["event_023"]
    },
    {
        id: "char_029",
        name: "忽必烈",
        title: "元世祖",
        birth: "公元1215年",
        death: "公元1294年",
        description: "元朝开国皇帝",
        category: "political",
        achievements: [
            "建立元朝",
            "定都大都",
            "灭南宋，统一全国",
            "推行汉化政策"
        ],
        relatedEvents: ["event_024", "event_025"]
    },
    {
        id: "char_030",
        name: "朱元璋",
        title: "明太祖",
        birth: "公元1328年",
        death: "公元1398年",
        description: "明朝开国皇帝",
        category: "political",
        achievements: [
            "推翻元朝统治",
            "建立明朝",
            "加强中央集权",
            "恢复汉人统治"
        ],
        relatedEvents: ["event_026"]
    },
    {
        id: "char_031",
        name: "郑和",
        title: "明朝航海家",
        birth: "公元1371年",
        death: "公元1433年",
        description: "明朝著名航海家，七次下西洋",
        category: "political",
        achievements: [
            "七次下西洋",
            "访问30多个国家",
            "促进海上丝绸之路发展",
            "展示明朝国力"
        ],
        relatedEvents: ["event_027"]
    },
    {
        id: "char_032",
        name: "明成祖",
        title: "明朝皇帝",
        birth: "公元1360年",
        death: "公元1424年",
        description: "明朝第三位皇帝",
        category: "political",
        achievements: [
            "迁都北京",
            "修建紫禁城",
            "派遣郑和下西洋",
            "编纂《永乐大典》"
        ],
        relatedEvents: ["event_027", "event_028"]
    },
    {
        id: "char_033",
        name: "李自成",
        title: "明末农民起义领袖",
        birth: "公元1606年",
        death: "公元1645年",
        description: "明末农民起义领袖",
        category: "military",
        achievements: [
            "发动农民起义",
            "攻入北京，推翻明朝"
        ],
        relatedEvents: ["event_029"]
    },
    {
        id: "char_034",
        name: "崇祯帝",
        title: "明朝末代皇帝",
        birth: "公元1611年",
        death: "公元1644年",
        description: "明朝末代皇帝",
        category: "political",
        achievements: [],
        relatedEvents: ["event_029"]
    },
    {
        id: "char_035",
        name: "顺治帝",
        title: "清朝皇帝",
        birth: "公元1638年",
        death: "公元1661年",
        description: "清朝入关后的第一位皇帝",
        category: "political",
        achievements: [
            "清军入关",
            "定都北京",
            "开始清朝统治"
        ],
        relatedEvents: ["event_030"]
    },
    {
        id: "char_036",
        name: "康熙帝",
        title: "清朝皇帝",
        birth: "公元1654年",
        death: "公元1722年",
        description: "清朝第四位皇帝，开创了康乾盛世",
        category: "political",
        achievements: [
            "平定三藩之乱",
            "收复台湾",
            "击败沙俄，签订《尼布楚条约》",
            "开创康乾盛世"
        ],
        relatedEvents: ["event_031"]
    },
    {
        id: "char_037",
        name: "马戛尔尼",
        title: "英国使节",
        birth: "公元1737年",
        death: "公元1806年",
        description: "英国使节，1793年率领使团访华",
        category: "political",
        achievements: [
            "率领英国使团访华",
            "试图打开中国市场"
        ],
        relatedEvents: ["event_032"]
    },
    {
        id: "char_038",
        name: "乾隆帝",
        title: "清朝皇帝",
        birth: "公元1711年",
        death: "公元1799年",
        description: "清朝第六位皇帝",
        category: "political",
        achievements: [
            "平定大小和卓叛乱",
            "巩固边疆",
            "编纂《四库全书》"
        ],
        relatedEvents: ["event_032"]
    },
    {
        id: "char_039",
        name: "林则徐",
        title: "清朝官员",
        birth: "公元1785年",
        death: "公元1850年",
        description: "清朝著名政治家、思想家",
        category: "political",
        achievements: [
            "虎门销烟",
            "领导抗英斗争",
            "开眼看世界第一人"
        ],
        relatedEvents: ["event_033"]
    },
    {
        id: "char_040",
        name: "洪秀全",
        title: "太平天国天王",
        birth: "公元1814年",
        death: "公元1864年",
        description: "太平天国运动领袖",
        category: "political",
        achievements: [
            "发动太平天国运动",
            "建立太平天国政权"
        ],
        relatedEvents: ["event_034"]
    },
    {
        id: "char_041",
        name: "李鸿章",
        title: "清朝官员",
        birth: "公元1823年",
        death: "公元1901年",
        description: "清朝著名政治家、外交家",
        category: "political",
        achievements: [
            "洋务运动领袖",
            "创办近代工业",
            "签订《马关条约》"
        ],
        relatedEvents: ["event_035"]
    },
    {
        id: "char_042",
        name: "光绪帝",
        title: "清朝皇帝",
        birth: "公元1871年",
        death: "公元1908年",
        description: "清朝第十一位皇帝",
        category: "political",
        achievements: [
            "支持戊戌变法",
            "试图改革清朝"
        ],
        relatedEvents: ["event_036"]
    },
    {
        id: "char_043",
        name: "康有为",
        title: "清朝维新派",
        birth: "公元1858年",
        death: "公元1927年",
        description: "清朝维新派领袖",
        category: "philosopher",
        achievements: [
            "领导戊戌变法",
            "提出维新变法主张"
        ],
        relatedEvents: ["event_036"]
    },
    {
        id: "char_044",
        name: "梁启超",
        title: "清朝维新派",
        birth: "公元1873年",
        death: "公元1929年",
        description: "清朝维新派领袖，著名学者",
        category: "literary",
        achievements: [
            "参与戊戌变法",
            "推动新文化运动"
        ],
        relatedEvents: ["event_036"]
    },
    {
        id: "char_045",
        name: "慈禧太后",
        title: "清朝太后",
        birth: "公元1835年",
        death: "公元1908年",
        description: "清朝实际统治者",
        category: "political",
        achievements: [
            "垂帘听政",
            "镇压戊戌变法"
        ],
        relatedEvents: ["event_037"]
    },
    {
        id: "char_046",
        name: "孙中山",
        title: "中华民国国父",
        birth: "公元1866年",
        death: "公元1925年",
        description: "中国近代民主革命家",
        category: "political",
        achievements: [
            "领导辛亥革命",
            "推翻清朝统治",
            "建立中华民国",
            "提出三民主义"
        ],
        relatedEvents: ["event_038", "event_039"]
    },
    {
        id: "char_047",
        name: "陈独秀",
        title: "新文化运动领袖",
        birth: "公元1879年",
        death: "公元1942年",
        description: "新文化运动领袖",
        category: "literary",
        achievements: [
            "创办《新青年》",
            "领导新文化运动",
            "宣传民主与科学"
        ],
        relatedEvents: ["event_040"]
    },
    {
        id: "char_048",
        name: "李大钊",
        title: "中国共产党先驱",
        birth: "公元1889年",
        death: "公元1927年",
        description: "中国共产党先驱",
        category: "philosopher",
        achievements: [
            "传播马克思主义",
            "参与创建中国共产党",
            "领导五四运动"
        ],
        relatedEvents: ["event_040"]
    },
    {
        id: "char_049",
        name: "毛泽东",
        title: "中华人民共和国主席",
        birth: "公元1893年",
        death: "公元1976年",
        description: "中华人民共和国主要缔造者",
        category: "political",
        achievements: [
            "领导中国革命",
            "建立中华人民共和国",
            "领导中国人民取得抗日战争胜利",
            "开创社会主义建设"
        ],
        relatedEvents: ["event_041", "event_043", "event_044", "event_045", "event_046", "event_048", "event_049"]
    },
    {
        id: "char_050",
        name: "蒋介石",
        title: "中华民国总统",
        birth: "公元1887年",
        death: "公元1975年",
        description: "中华民国总统",
        category: "political",
        achievements: [
            "领导北伐战争",
            "领导抗日战争",
            "退守台湾"
        ],
        relatedEvents: ["event_042", "event_044", "event_045"]
    },
    {
        id: "char_051",
        name: "彭德怀",
        title: "中国人民解放军元帅",
        birth: "公元1898年",
        death: "公元1974年",
        description: "中国人民解放军元帅",
        category: "military",
        achievements: [
            "领导抗美援朝战争",
            "指挥百团大战"
        ],
        relatedEvents: ["event_047"]
    },
    {
        id: "char_052",
        name: "邓小平",
        title: "中国改革开放总设计师",
        birth: "公元1904年",
        death: "公元1997年",
        description: "中国改革开放总设计师",
        category: "political",
        achievements: [
            "领导改革开放",
            "提出一国两制",
            "推动中国现代化建设"
        ],
        relatedEvents: ["event_050"]
    }
];
