import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Heart, Share2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface NameData {
  id: string;
  fullName: string;
  pinyin: string;
  gender: string;
  source: string;
  meaning: string;
  fiveElements: string;
  soundAnalysis: string;
  score: number;
  analysis?: {
    fiveElementsScore?: number;
    soundScore?: number;
    culturalScore?: number;
    uniquenessScore?: number;
  };
}

export default function NameDetail() {
  
  // 从 localStorage 获取名字数据
  const nameDataStr = typeof window !== "undefined" ? localStorage.getItem("selectedName") : null;
  const nameData: NameData | null = nameDataStr ? JSON.parse(nameDataStr) : null;

  const [isFavorited, setIsFavorited] = useState(false);

  if (!nameData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">未找到名字信息</p>
          <Link href="/naming">
            <Button variant="outline">
              返回取名
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 模拟维度数据
  const dimensionData = [
    { name: "五行", value: nameData.analysis?.fiveElementsScore || 85 },
    { name: "音韵", value: nameData.analysis?.soundScore || 88 },
    { name: "文化", value: nameData.analysis?.culturalScore || 92 },
    { name: "独特", value: nameData.analysis?.uniquenessScore || 78 },
  ];

  const radarData = [
    { category: "五行匹配", value: nameData.analysis?.fiveElementsScore || 85 },
    { category: "音韵美感", value: nameData.analysis?.soundScore || 88 },
    { category: "文化内涵", value: nameData.analysis?.culturalScore || 92 },
    { category: "独特性", value: nameData.analysis?.uniquenessScore || 78 },
    { category: "整体评分", value: nameData.score },
  ];

  const handleCopyName = () => {
    navigator.clipboard.writeText(nameData.fullName);
    toast.success("已复制到剪贴板");
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "已取消收藏" : "已收藏");
  };

  const handleShare = () => {
    toast.success("分享功能开发中");
  };

  return (
    <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <Link href="/naming">
            <Button
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">名字详情</h1>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* 左侧：名字信息 */}
          <div className="lg:col-span-1">
            {/* 名字卡片 */}
            <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="text-center">
                <div className="mb-4">
                  <h2 className="text-5xl md:text-6xl font-bold text-primary mb-2">
                    {nameData.fullName}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground">{nameData.pinyin}</p>
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {nameData.gender === "male" ? "男孩" : nameData.gender === "female" ? "女孩" : "中性"}
                  </span>
                  <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full">
                    {nameData.fiveElements}
                  </span>
                </div>
                <div className="text-4xl font-bold text-secondary mb-4">{nameData.score} 分</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={handleCopyName}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制名字
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleToggleFavorite}
                      variant={isFavorited ? "default" : "outline"}
                      className="flex-1"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                      收藏
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nameData.source && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">出处</p>
                    <p className="text-sm text-foreground">{nameData.source}</p>
                  </div>
                )}
                {nameData.meaning && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">寓意</p>
                    <p className="text-sm text-foreground leading-relaxed">{nameData.meaning}</p>
                  </div>
                )}
                {nameData.soundAnalysis && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">音韵分析</p>
                    <p className="text-sm text-foreground">{nameData.soundAnalysis}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：图表展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 柱状图 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">维度评分</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dimensionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 雷达图 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">综合分析</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar 
                      name="评分" 
                      dataKey="value" 
                      stroke="var(--primary)" 
                      fill="var(--primary)"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 详细分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">详细分析</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs text-muted-foreground mb-2">五行匹配</p>
                    <p className="text-2xl font-bold text-primary">{nameData.analysis?.fiveElementsScore || 85}%</p>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                    <p className="text-xs text-muted-foreground mb-2">音韵美感</p>
                    <p className="text-2xl font-bold text-secondary">{nameData.analysis?.soundScore || 88}%</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                    <p className="text-xs text-muted-foreground mb-2">文化内涵</p>
                    <p className="text-2xl font-bold text-accent">{nameData.analysis?.culturalScore || 92}%</p>
                  </div>
                  <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                    <p className="text-xs text-muted-foreground mb-2">独特性</p>
                    <p className="text-2xl font-bold text-destructive">{nameData.analysis?.uniquenessScore || 78}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
