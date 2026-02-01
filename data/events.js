const historicalEvents = [
    {
        id: "event_001",
        year: "公元前221年",
        title: "秦始皇统一六国",
        description: "秦灭六国，建立中国历史上第一个统一的多民族国家，实行郡县制，统一文字、度量衡和货币",
        category: "political",
        characters: [
            { id: "char_001", name: "秦始皇" },
            { id: "char_002", name: "李斯" }
        ],
        location: "咸阳",
        tags: ["统一", "秦朝", "政治改革"]
    },
    {
        id: "event_002",
        year: "公元前206年",
        title: "秦朝灭亡",
        description: "秦末农民起义爆发，刘邦攻入咸阳，秦朝灭亡",
        category: "political",
        characters: [
            { id: "char_003", name: "刘邦" },
            { id: "char_004", name: "项羽" }
        ],
        location: "咸阳",
        tags: ["秦朝", "农民起义", "改朝换代"]
    },
    {
        id: "event_003",
        year: "公元前202年",
        title: "汉朝建立",
        description: "刘邦建立汉朝，定都长安，开创了中国历史上第一个长期统一的王朝",
        category: "political",
        characters: [
            { id: "char_003", name: "刘邦" }
        ],
        location: "长安",
        tags: ["汉朝", "建立", "统一"]
    },
    {
        id: "event_004",
        year: "公元前138年",
        title: "张骞出使西域",
        description: "汉武帝派遣张骞出使西域，开辟了丝绸之路，促进了东西方文化交流",
        category: "cultural",
        characters: [
            { id: "char_005", name: "张骞" },
            { id: "char_006", name: "汉武帝" }
        ],
        location: "西域",
        tags: ["丝绸之路", "文化交流", "外交"]
    },
    {
        id: "event_005",
        year: "公元208年",
        title: "赤壁之战",
        description: "孙刘联军在赤壁大败曹操，奠定了三国鼎立的局面",
        category: "military",
        characters: [
            { id: "char_007", name: "曹操" },
            { id: "char_008", name: "刘备" },
            { id: "char_009", name: "孙权" }
        ],
        location: "赤壁",
        tags: ["三国", "战役", "军事"]
    },
    {
        id: "event_006",
        year: "公元220年",
        title: "三国时期开始",
        description: "曹丕废汉献帝，建立魏国，三国时期正式开始",
        category: "political",
        characters: [
            { id: "char_010", name: "曹丕" }
        ],
        location: "洛阳",
        tags: ["三国", "政治", "改朝换代"]
    },
    {
        id: "event_007",
        year: "公元265年",
        title: "西晋建立",
        description: "司马炎废魏帝，建立晋朝，结束了三国分裂局面",
        category: "political",
        characters: [
            { id: "char_011", name: "司马炎" }
        ],
        location: "洛阳",
        tags: ["晋朝", "统一", "政治"]
    },
    {
        id: "event_008",
        year: "公元280年",
        title: "西晋统一全国",
        description: "晋军灭吴，结束了三国分裂局面，实现了全国统一",
        category: "political",
        characters: [
            { id: "char_011", name: "司马炎" }
        ],
        location: "建业",
        tags: ["晋朝", "统一", "军事"]
    },
    {
        id: "event_009",
        year: "公元317年",
        title: "东晋建立",
        description: "西晋灭亡后，司马睿在建康建立东晋，开始了南北朝时期",
        category: "political",
        characters: [
            { id: "char_012", name: "司马睿" }
        ],
        location: "建康",
        tags: ["东晋", "南北朝", "政治"]
    },
    {
        id: "event_010",
        year: "公元420年",
        title: "刘宋代晋",
        description: "刘裕废晋恭帝，建立宋朝，南朝开始",
        category: "political",
        characters: [
            { id: "char_013", name: "刘裕" }
        ],
        location: "建康",
        tags: ["南朝", "刘宋", "改朝换代"]
    },
    {
        id: "event_011",
        year: "公元581年",
        title: "隋朝建立",
        description: "杨坚建立隋朝，结束了南北朝分裂局面，实现了全国统一",
        category: "political",
        characters: [
            { id: "char_014", name: "杨坚" }
        ],
        location: "长安",
        tags: ["隋朝", "统一", "政治"]
    },
    {
        id: "event_012",
        year: "公元605年",
        title: "大运河开凿",
        description: "隋炀帝下令开凿大运河，连接了南北水路交通，促进了经济发展",
        category: "technology",
        characters: [
            { id: "char_015", name: "隋炀帝" }
        ],
        location: "大运河",
        tags: ["大运河", "水利工程", "科技"]
    },
    {
        id: "event_013",
        year: "公元618年",
        title: "唐朝建立",
        description: "李渊建立唐朝，开启了中国历史上最辉煌的时代之一",
        category: "political",
        characters: [
            { id: "char_016", name: "李渊" }
        ],
        location: "长安",
        tags: ["唐朝", "建立", "政治"]
    },
    {
        id: "event_014",
        year: "公元626年",
        title: "玄武门之变",
        description: "李世民发动玄武门之变，夺取皇位，开创了贞观之治",
        category: "political",
        characters: [
            { id: "char_017", name: "李世民" }
        ],
        location: "长安",
        tags: ["唐朝", "政治", "政变"]
    },
    {
        id: "event_015",
        year: "公元627年",
        title: "玄奘西行取经",
        description: "玄奘法师西行取经，历时17年，带回大量佛经，促进了中印文化交流",
        category: "cultural",
        characters: [
            { id: "char_018", name: "玄奘" }
        ],
        location: "印度",
        tags: ["佛教", "文化交流", "宗教"]
    },
    {
        id: "event_016",
        year: "公元690年",
        title: "武则天称帝",
        description: "武则天称帝，成为中国历史上唯一的女皇帝",
        category: "political",
        characters: [
            { id: "char_019", name: "武则天" }
        ],
        location: "洛阳",
        tags: ["唐朝", "女皇帝", "政治"]
    },
    {
        id: "event_017",
        year: "公元755年",
        title: "安史之乱",
        description: "安禄山和史思明发动叛乱，唐朝由盛转衰",
        category: "military",
        characters: [
            { id: "char_020", name: "安禄山" },
            { id: "char_021", name: "史思明" }
        ],
        location: "范阳",
        tags: ["唐朝", "叛乱", "军事"]
    },
    {
        id: "event_018",
        year: "公元907年",
        title: "唐朝灭亡",
        description: "朱温废唐哀帝，建立后梁，唐朝灭亡，五代十国开始",
        category: "political",
        characters: [
            { id: "char_022", name: "朱温" }
        ],
        location: "开封",
        tags: ["唐朝", "灭亡", "五代十国"]
    },
    {
        id: "event_019",
        year: "公元960年",
        title: "宋朝建立",
        description: "赵匡胤建立宋朝，结束了五代十国分裂局面",
        category: "political",
        characters: [
            { id: "char_023", name: "赵匡胤" }
        ],
        location: "开封",
        tags: ["宋朝", "建立", "统一"]
    },
    {
        id: "event_020",
        year: "公元1041年",
        title: "活字印刷术发明",
        description: "毕昇发明活字印刷术，大大提高了印刷效率，促进了文化传播",
        category: "technology",
        characters: [
            { id: "char_024", name: "毕昇" }
        ],
        location: "杭州",
        tags: ["印刷术", "发明", "科技"]
    },
    {
        id: "event_021",
        year: "公元1127年",
        title: "靖康之变",
        description: "金军攻破开封，俘虏宋徽宗、宋钦宗，北宋灭亡",
        category: "military",
        characters: [
            { id: "char_025", name: "宋徽宗" },
            { id: "char_026", name: "宋钦宗" }
        ],
        location: "开封",
        tags: ["北宋", "灭亡", "军事"]
    },
    {
        id: "event_022",
        year: "公元1127年",
        title: "南宋建立",
        description: "赵构在临安建立南宋，开始了南宋与金的对峙",
        category: "political",
        characters: [
            { id: "char_027", name: "赵构" }
        ],
        location: "临安",
        tags: ["南宋", "建立", "政治"]
    },
    {
        id: "event_023",
        year: "公元1206年",
        title: "蒙古帝国建立",
        description: "铁木真统一蒙古各部，建立蒙古帝国，尊号成吉思汗",
        category: "political",
        characters: [
            { id: "char_028", name: "成吉思汗" }
        ],
        location: "蒙古",
        tags: ["蒙古", "帝国", "统一"]
    },
    {
        id: "event_024",
        year: "公元1271年",
        title: "元朝建立",
        description: "忽必烈建立元朝，定都大都，开始了蒙古族统治的王朝",
        category: "political",
        characters: [
            { id: "char_029", name: "忽必烈" }
        ],
        location: "大都",
        tags: ["元朝", "建立", "政治"]
    },
    {
        id: "event_025",
        year: "公元1279年",
        title: "元朝统一全国",
        description: "元军灭南宋，实现了全国统一，结束了长期分裂局面",
        category: "political",
        characters: [
            { id: "char_029", name: "忽必烈" }
        ],
        location: "崖山",
        tags: ["元朝", "统一", "军事"]
    },
    {
        id: "event_026",
        year: "公元1368年",
        title: "明朝建立",
        description: "朱元璋建立明朝，定都南京，结束了元朝统治",
        category: "political",
        characters: [
            { id: "char_030", name: "朱元璋" }
        ],
        location: "南京",
        tags: ["明朝", "建立", "政治"]
    },
    {
        id: "event_027",
        year: "公元1405年",
        title: "郑和下西洋",
        description: "郑和率领庞大船队七次下西洋，访问了30多个国家，促进了海上丝绸之路的发展",
        category: "cultural",
        characters: [
            { id: "char_031", name: "郑和" },
            { id: "char_032", name: "明成祖" }
        ],
        location: "西洋",
        tags: ["郑和", "航海", "外交"]
    },
    {
        id: "event_028",
        year: "公元1421年",
        title: "迁都北京",
        description: "明成祖迁都北京，修建了紫禁城，确立了北京的政治中心地位",
        category: "political",
        characters: [
            { id: "char_032", name: "明成祖" }
        ],
        location: "北京",
        tags: ["明朝", "迁都", "政治"]
    },
    {
        id: "event_029",
        year: "公元1644年",
        title: "明朝灭亡",
        description: "李自成攻入北京，崇祯帝自缢，明朝灭亡",
        category: "political",
        characters: [
            { id: "char_033", name: "李自成" },
            { id: "char_034", name: "崇祯帝" }
        ],
        location: "北京",
        tags: ["明朝", "灭亡", "农民起义"]
    },
    {
        id: "event_030",
        year: "公元1644年",
        title: "清朝建立",
        description: "清军入关，顺治帝迁都北京，清朝开始统治中国",
        category: "political",
        characters: [
            { id: "char_035", name: "顺治帝" }
        ],
        location: "北京",
        tags: ["清朝", "建立", "政治"]
    },
    {
        id: "event_031",
        year: "公元1683年",
        title: "清朝统一台湾",
        description: "清军攻占台湾，郑克塽投降，清朝实现了全国统一",
        category: "political",
        characters: [
            { id: "char_036", name: "康熙帝" }
        ],
        location: "台湾",
        tags: ["清朝", "统一", "军事"]
    },
    {
        id: "event_032",
        year: "公元1793年",
        title: "马戛尔尼使团访华",
        description: "英国使团访华，试图打开中国市场，但未能成功",
        category: "cultural",
        characters: [
            { id: "char_037", name: "马戛尔尼" },
            { id: "char_038", name: "乾隆帝" }
        ],
        location: "北京",
        tags: ["外交", "中英关系", "文化交流"]
    },
    {
        id: "event_033",
        year: "公元1840年",
        title: "第一次鸦片战争",
        description: "英国发动鸦片战争，打开了中国的大门，中国开始沦为半殖民地半封建社会",
        category: "military",
        characters: [
            { id: "char_039", name: "林则徐" }
        ],
        location: "广州",
        tags: ["鸦片战争", "侵略", "军事"]
    },
    {
        id: "event_034",
        year: "公元1851年",
        title: "太平天国运动",
        description: "洪秀全发动太平天国运动，建立了太平天国政权",
        category: "political",
        characters: [
            { id: "char_040", name: "洪秀全" }
        ],
        location: "广西",
        tags: ["太平天国", "农民起义", "政治"]
    },
    {
        id: "event_035",
        year: "公元1894年",
        title: "甲午中日战争",
        description: "中日甲午战争爆发，中国战败，签订《马关条约》",
        category: "military",
        characters: [
            { id: "char_041", name: "李鸿章" }
        ],
        location: "黄海",
        tags: ["甲午战争", "日本", "军事"]
    },
    {
        id: "event_036",
        year: "公元1898年",
        title: "戊戌变法",
        description: "光绪帝支持康有为、梁启超等人进行变法，但仅持续103天就失败了",
        category: "political",
        characters: [
            { id: "char_042", name: "光绪帝" },
            { id: "char_043", name: "康有为" },
            { id: "char_044", name: "梁启超" }
        ],
        location: "北京",
        tags: ["戊戌变法", "改革", "政治"]
    },
    {
        id: "event_037",
        year: "公元1900年",
        title: "义和团运动",
        description: "义和团运动爆发，八国联军侵华，签订《辛丑条约》",
        category: "military",
        characters: [
            { id: "char_045", name: "慈禧太后" }
        ],
        location: "北京",
        tags: ["义和团", "八国联军", "军事"]
    },
    {
        id: "event_038",
        year: "公元1911年",
        title: "辛亥革命",
        description: "武昌起义爆发，辛亥革命开始，推翻了清朝统治",
        category: "political",
        characters: [
            { id: "char_046", name: "孙中山" }
        ],
        location: "武昌",
        tags: ["辛亥革命", "民主革命", "政治"]
    },
    {
        id: "event_039",
        year: "公元1912年",
        title: "中华民国成立",
        description: "中华民国成立，孙中山就任临时大总统，结束了两千多年的封建帝制",
        category: "political",
        characters: [
            { id: "char_046", name: "孙中山" }
        ],
        location: "南京",
        tags: ["中华民国", "建立", "政治"]
    },
    {
        id: "event_040",
        year: "公元1919年",
        title: "五四运动",
        description: "五四运动爆发，标志着中国新民主主义革命的开始",
        category: "cultural",
        characters: [
            { id: "char_047", name: "陈独秀" },
            { id: "char_048", name: "李大钊" }
        ],
        location: "北京",
        tags: ["五四运动", "新文化", "革命"]
    },
    {
        id: "event_041",
        year: "公元1921年",
        title: "中国共产党成立",
        description: "中国共产党第一次全国代表大会在上海召开，中国共产党成立",
        category: "political",
        characters: [
            { id: "char_049", name: "毛泽东" }
        ],
        location: "上海",
        tags: ["中国共产党", "建立", "政治"]
    },
    {
        id: "event_042",
        year: "公元1926年",
        title: "北伐战争",
        description: "国民革命军开始北伐，目标是统一中国",
        category: "military",
        characters: [
            { id: "char_050", name: "蒋介石" }
        ],
        location: "广州",
        tags: ["北伐", "战争", "军事"]
    },
    {
        id: "event_043",
        year: "公元1934年",
        title: "长征开始",
        description: "中国工农红军开始长征，历时两年，行程二万五千里",
        category: "military",
        characters: [
            { id: "char_049", name: "毛泽东" }
        ],
        location: "江西",
        tags: ["长征", "红军", "军事"]
    },
    {
        id: "event_044",
        year: "公元1937年",
        title: "七七事变",
        description: "七七事变爆发，日本全面侵华，抗日战争开始",
        category: "military",
        characters: [
            { id: "char_049", name: "毛泽东" },
            { id: "char_050", name: "蒋介石" }
        ],
        location: "卢沟桥",
        tags: ["抗日战争", "日本", "军事"]
    },
    {
        id: "event_045",
        year: "公元1945年",
        title: "抗日战争胜利",
        description: "日本宣布无条件投降，中国人民抗日战争取得胜利",
        category: "military",
        characters: [
            { id: "char_049", name: "毛泽东" },
            { id: "char_050", name: "蒋介石" }
        ],
        location: "全国",
        tags: ["抗日战争", "胜利", "军事"]
    },
    {
        id: "event_046",
        year: "公元1949年",
        title: "中华人民共和国成立",
        description: "中华人民共和国成立，毛泽东当选为中央人民政府主席",
        category: "political",
        characters: [
            { id: "char_049", name: "毛泽东" }
        ],
        location: "北京",
        tags: ["中华人民共和国", "建立", "政治"]
    },
    {
        id: "event_047",
        year: "公元1950年",
        title: "抗美援朝",
        description: "中国人民志愿军赴朝参战，抗美援朝战争开始",
        category: "military",
        characters: [
            { id: "char_051", name: "彭德怀" }
        ],
        location: "朝鲜",
        tags: ["抗美援朝", "战争", "军事"]
    },
    {
        id: "event_048",
        year: "公元1958年",
        title: "大跃进",
        description: "全国开展大跃进运动，试图快速实现工业化",
        category: "political",
        characters: [
            { id: "char_049", name: "毛泽东" }
        ],
        location: "全国",
        tags: ["大跃进", "政治", "经济"]
    },
    {
        id: "event_049",
        year: "公元1966年",
        title: "文化大革命",
        description: "文化大革命开始，给中国带来了巨大的灾难",
        category: "political",
        characters: [
            { id: "char_049", name: "毛泽东" }
        ],
        location: "全国",
        tags: ["文化大革命", "政治", "运动"]
    },
    {
        id: "event_050",
        year: "公元1978年",
        title: "改革开放",
        description: "十一届三中全会召开，中国开始实行改革开放政策",
        category: "political",
        characters: [
            { id: "char_052", name: "邓小平" }
        ],
        location: "北京",
        tags: ["改革开放", "政策", "政治"]
    }
];
