import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Copy, Heart, Loader2 } from "lucide-react";

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

export default function NamingGenerator() {
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
    history: [],
  });

  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateNamesMutation = trpc.naming.generateNames.useMutation();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateNames = async () => {
    if (!formData.surname.trim()) {
      toast.error("请输入宝宝姓氏");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateNamesMutation.mutateAsync({
        ...formData,
        follow: formData.follow as "father" | "mother",
        nameLength: parseInt(formData.nameLength.toString()),
        count: parseInt(formData.count.toString()),
      });

      if (result.code === 0 && result.data?.names) {
        setGeneratedNames(result.data.names);
        toast.success(`成功生成 ${result.data.names.length} 个名字！`);
      } else {
        toast.error(result.message || "生成失败，请重试");
      }
    } catch (error) {
      toast.error("生成名字时出错，请检查网络连接");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success("已复制到剪贴板");
  };

  const handleResetForm = () => {
    setFormData({
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
      history: [],
    });
    setGeneratedNames([]);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>取名信息</CardTitle>
                <CardDescription>请填写宝宝的相关信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-2">
                  <Label htmlFor="surname">
                    宝宝姓氏 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="surname"
                    placeholder="必填"
                    value={formData.surname}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">宝宝性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男孩</SelectItem>
                      <SelectItem value="female">女孩</SelectItem>
                      <SelectItem value="unknown">未知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">出生日期</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange("birthday", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meaning">期望寓意</Label>
                  <Textarea
                    id="meaning"
                    placeholder="期望名字的寓意"
                    value={formData.meaning}
                    onChange={(e) => handleInputChange("meaning", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">风格</Label>
                  <Select value={formData.style} onValueChange={(value) => handleInputChange("style", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择风格" />
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

                <div className="space-y-2">
                  <Label htmlFor="five-elements">五行</Label>
                  <Select value={formData.fiveElements} onValueChange={(value) => handleInputChange("fiveElements", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择五行" />
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

                <div className="space-y-2">
                  <Label htmlFor="zodiac">期望生肖</Label>
                  <Select value={formData.zodiac} onValueChange={(value) => handleInputChange("zodiac", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择生肖" />
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

                <div className="space-y-2">
                  <Label htmlFor="culture-source">文化典故</Label>
                  <Select value={formData.cultureSource} onValueChange={(value) => handleInputChange("cultureSource", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择文化来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shijing">诗经</SelectItem>
                      <SelectItem value="chuci">楚辞</SelectItem>
                      <SelectItem value="tang">唐诗</SelectItem>
                      <SelectItem value="song">宋词</SelectItem>
                      <SelectItem value="idiom">成语</SelectItem>
                      <SelectItem value="modern">现代文学</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>名字字数</Label>
                  <RadioGroup value={formData.nameLength.toString()} onValueChange={(value) => handleInputChange("nameLength", parseInt(value))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="length-1" />
                      <Label htmlFor="length-1" className="font-normal cursor-pointer">1 字</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="length-2" />
                      <Label htmlFor="length-2" className="font-normal cursor-pointer">2 字</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>生成数量</Label>
                  <RadioGroup value={formData.count.toString()} onValueChange={(value) => handleInputChange("count", parseInt(value))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10" id="count-10" />
                      <Label htmlFor="count-10" className="font-normal cursor-pointer">10 个</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="20" id="count-20" />
                      <Label htmlFor="count-20" className="font-normal cursor-pointer">20 个</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={handleGenerateNames}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      "生成名字"
                    )}
                  </Button>
                  <Button
                    onClick={handleResetForm}
                    variant="outline"
                    className="w-full"
                  >
                    重置表单
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {generatedNames.length === 0 ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-lg">填写表单后，点击"生成名字"查看结果</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">生成结果</h3>
                <div className="names-grid">
                  {generatedNames.map((name) => (
                    <Card key={name.id} className="name-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl text-primary">{name.fullName}</CardTitle>
                            <CardDescription className="text-base">{name.pinyin}</CardDescription>
                          </div>
                          <div className="text-2xl font-bold text-secondary">{name.score}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="badge-gender">
                            {name.gender === "male" ? "男" : name.gender === "female" ? "女" : "中性"}
                          </span>
                          <span className="badge-element">{name.fiveElements}</span>
                        </div>

                        {name.source && (
                          <div>
                            <p className="text-sm font-semibold text-foreground">出处</p>
                            <p className="text-sm text-muted-foreground">{name.source}</p>
                          </div>
                        )}

                        {name.meaning && (
                          <div>
                            <p className="text-sm font-semibold text-foreground">寓意</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{name.meaning}</p>
                          </div>
                        )}

                        {name.soundAnalysis && (
                          <div>
                            <p className="text-sm font-semibold text-foreground">音韵分析</p>
                            <p className="text-sm text-muted-foreground">{name.soundAnalysis}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyName(name.fullName)}
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            复制
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            收藏
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
