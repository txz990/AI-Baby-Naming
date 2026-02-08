import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Copy, Heart, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import GenerationModal from "@/components/GenerationModal";

interface GeneratedName {
  id: string;
  fullName: string;
  pinyin: string;
  gender: string;
  source: string;
  meaning: string;
  fiveElements: string;
  soundAnalysis: string;
  score: number;
}

// 名字偏旁符号映射
const RADICAL_SYMBOLS: Record<string, string> = {
  wood: "木",
  water: "氵",
  fire: "火",
  earth: "土",
  metal: "金",
  grass: "艹",
  female: "女",
  roof: "宀",
  person: "亻",
  double_person: "彳",
  none: "不限",
};

// 分隔符正则
const SEPARATOR_REGEX = /[\s，。、；：！？\n\r,.\-_]/g;

export default function NamingGenerator() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fatherName: "",
    motherName: "",
    surname: "",
    follow: "father" as "father" | "mother",
    birthday: "",
    birthTime: "",
    gender: "unknown" as "male" | "female" | "unknown",
    preference: "",
    meaning: "",
    style: "",
    fiveElements: "",
    custom: "",
    avoidChars: "",
    soundPreference: "",
    zodiac: "",
    cultureSource: "",
    radical: "",
    constellation: "",
    international: false,
    nameLength: 2,
    count: 10,
  });

  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  const generateNamesMutation = trpc.naming.generateNames.useMutation();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理避开字辈，智能识别分隔符
  const processAvoidChars = (input: string): string => {
    return input
      .split(SEPARATOR_REGEX)
      .filter(char => char.length > 0)
      .join(",");
  };

  const handleGenerateNames = async () => {
    if (!formData.surname.trim()) {
      toast.error("请输入宝宝姓氏");
      return;
    }

    localStorage.setItem("generationFormData", JSON.stringify(formData));
    setLocation("/generation-result");

    const messages = [
      "正在分析八字...",
      "正在查阅古籍...",
      "正在优化音韵...",
      "正在生成名字...",
      "即将完成...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 800);

    try {
      const processedData = {
        ...formData,
        avoidChars: processAvoidChars(formData.avoidChars),
        nameLength: parseInt(formData.nameLength.toString()),
        count: parseInt(formData.count.toString()),
      };

      const result = await generateNamesMutation.mutateAsync(processedData);

      if (result.code === 0 && result.data?.names) {
        setGeneratedNames(result.data.names);
        setIsLoading(false);
        toast.success(`成功生成 ${result.data.names.length} 个名字！`);
      } else {
        setIsLoading(false);
        toast.error(result.message || "生成失败，请重试");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("生成名字时出错，请检查网络连接");
      console.error(error);
    } finally {
      clearInterval(messageInterval);
      setLoadingMessage("");
    }
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success("已复制到剪贴板");
  };

  const handleViewDetail = (name: GeneratedName) => {
    localStorage.setItem("selectedName", JSON.stringify(name));
  };

  const handleCloseModal = () => {
    setShowGenerationModal(false);
  };

  const handleResetSurname = () => {
    setFormData(prev => ({
      ...prev,
      surname: "",
    }));
  };

  return (
    <>
      <GenerationModal
        isOpen={showGenerationModal}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        generatedNames={generatedNames}
        onClose={handleCloseModal}
        onViewDetail={handleViewDetail}
      />
      <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">为宝宝取名</h1>
          <p className="text-sm md:text-base text-muted-foreground">填写宝宝的信息，AI 将为您生成富有文化内涵的名字</p>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          <div className="lg:col-span-1 space-y-6">
            {/* 基础信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基础信息</CardTitle>
                <CardDescription>宝宝的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">宝宝姓氏 <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="必填"
                    value={formData.surname}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">父亲姓名</Label>
                    <Input
                      placeholder="可选"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange("fatherName", e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">母亲姓名</Label>
                    <Input
                      placeholder="可选"
                      value={formData.motherName}
                      onChange={(e) => handleInputChange("motherName", e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">性别</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男孩</SelectItem>
                        <SelectItem value="female">女孩</SelectItem>
                        <SelectItem value="unknown">未知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">跟随</Label>
                    <Select value={formData.follow} onValueChange={(value) => handleInputChange("follow", value as "father" | "mother")}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">父亲</SelectItem>
                        <SelectItem value="mother">母亲</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">出生日期</Label>
                    <Input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleInputChange("birthday", e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">出生时辰</Label>
                    <Input
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) => handleInputChange("birthTime", e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 取名偏好 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">取名偏好</CardTitle>
                <CardDescription>您期望的名字风格和特点</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">期望寓意</Label>
                  <Textarea
                    placeholder="如：聪慧、善良、勇敢"
                    value={formData.meaning}
                    onChange={(e) => handleInputChange("meaning", e.target.value)}
                    rows={2}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">风格</Label>
                    <Select value={formData.style} onValueChange={(value) => handleInputChange("style", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ancient">古风</SelectItem>
                        <SelectItem value="modern">现代</SelectItem>
                        <SelectItem value="poetic">诗意</SelectItem>
                        <SelectItem value="fresh">清新</SelectItem>
                        <SelectItem value="elegant">典雅</SelectItem>
                        <SelectItem value="grand">大气</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">五行</Label>
                    <Select value={formData.fiveElements} onValueChange={(value) => handleInputChange("fiveElements", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metal">金</SelectItem>
                        <SelectItem value="wood">木</SelectItem>
                        <SelectItem value="water">水</SelectItem>
                        <SelectItem value="fire">火</SelectItem>
                        <SelectItem value="earth">土</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">自定义字</Label>
                  <Input
                    placeholder="指定必须包含的字"
                    value={formData.custom}
                    onChange={(e) => handleInputChange("custom", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block">取名偏好</Label>
                  <Input
                    placeholder="如：文雅、大气、响亮"
                    value={formData.preference}
                    onChange={(e) => handleInputChange("preference", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 高级选项 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">高级选项</CardTitle>
                <CardDescription>更多定制化选择</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">避开字辈</Label>
                  <Textarea
                    placeholder="输入不希望使用的字，支持空格、句号、逗号等分隔"
                    value={formData.avoidChars}
                    onChange={(e) => handleInputChange("avoidChars", e.target.value)}
                    rows={2}
                    className="bg-background border-border resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">系统会自动识别分隔符</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">音韵偏好</Label>
                    <Select value={formData.soundPreference} onValueChange={(value) => handleInputChange("soundPreference", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pingze">平仄搭配</SelectItem>
                        <SelectItem value="all_ping">全平</SelectItem>
                        <SelectItem value="all_ze">全仄</SelectItem>
                        <SelectItem value="loud">响亮</SelectItem>
                        <SelectItem value="soft">柔美</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">生肖</Label>
                    <Select value={formData.zodiac} onValueChange={(value) => handleInputChange("zodiac", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rat">鼠</SelectItem>
                        <SelectItem value="ox">牛</SelectItem>
                        <SelectItem value="tiger">虎</SelectItem>
                        <SelectItem value="rabbit">兔</SelectItem>
                        <SelectItem value="dragon">龙</SelectItem>
                        <SelectItem value="snake">蛇</SelectItem>
                        <SelectItem value="horse">马</SelectItem>
                        <SelectItem value="goat">羊</SelectItem>
                        <SelectItem value="monkey">猴</SelectItem>
                        <SelectItem value="rooster">鸡</SelectItem>
                        <SelectItem value="dog">狗</SelectItem>
                        <SelectItem value="pig">猪</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">文化典故</Label>
                    <Select value={formData.cultureSource} onValueChange={(value) => handleInputChange("cultureSource", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shijing">诗经</SelectItem>
                        <SelectItem value="chuci">楚辞</SelectItem>
                        <SelectItem value="tang">唐诗</SelectItem>
                        <SelectItem value="song">宋词</SelectItem>
                        <SelectItem value="idiom">成语</SelectItem>
                        <SelectItem value="modern">现代文学</SelectItem>
                        <SelectItem value="none">不限</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">星座</Label>
                    <Select value={formData.constellation} onValueChange={(value) => handleInputChange("constellation", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aries">白羊</SelectItem>
                        <SelectItem value="taurus">金牛</SelectItem>
                        <SelectItem value="gemini">双子</SelectItem>
                        <SelectItem value="cancer">巨蟹</SelectItem>
                        <SelectItem value="leo">狮子</SelectItem>
                        <SelectItem value="virgo">处女</SelectItem>
                        <SelectItem value="libra">天秤</SelectItem>
                        <SelectItem value="scorpio">天蝎</SelectItem>
                        <SelectItem value="sagittarius">射手</SelectItem>
                        <SelectItem value="capricorn">摩羯</SelectItem>
                        <SelectItem value="aquarius">水瓶</SelectItem>
                        <SelectItem value="pisces">双鱼</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">名字偏旁</Label>
                  <Select value={formData.radical} onValueChange={(value) => handleInputChange("radical", value)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">木</SelectItem>
                      <SelectItem value="water">氵</SelectItem>
                      <SelectItem value="fire">火</SelectItem>
                      <SelectItem value="earth">土</SelectItem>
                      <SelectItem value="metal">金</SelectItem>
                      <SelectItem value="grass">艹</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="roof">宀</SelectItem>
                      <SelectItem value="person">亻</SelectItem>
                      <SelectItem value="double_person">彳</SelectItem>
                      <SelectItem value="none">不限</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Checkbox
                    id="international"
                    checked={formData.international}
                    onCheckedChange={(checked) => handleInputChange("international", checked)}
                  />
                  <Label htmlFor="international" className="text-sm font-normal cursor-pointer">
                    考虑国际化（易于翻译）
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* 生成设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生成设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-3 block">名字字数</Label>
                  <div className="flex gap-2">
                    {[1, 2].map(len => (
                      <button
                        key={len}
                        onClick={() => handleInputChange("nameLength", len)}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                          formData.nameLength === len
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/50"
                        }`}
                      >
                        {len} 字
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-3 block">生成数量</Label>
                  <div className="flex gap-2">
                    {[10, 20].map(count => (
                      <button
                        key={count}
                        onClick={() => handleInputChange("count", count)}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                          formData.count === count
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/50"
                        }`}
                      >
                        {count} 个
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3 sticky bottom-4 md:bottom-6 z-40">
              <Button
                onClick={handleGenerateNames}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {loadingMessage || "生成中..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成名字
                  </>
                )}
              </Button>
              <Button
                onClick={handleResetSurname}
                variant="outline"
                className="w-full py-6 text-base font-semibold rounded-lg"
              >
                重置姓名
              </Button>
            </div>
          </div>


        </div>
      </div>
      </div>
    </>
  );
}
