import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Heart, Loader2, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

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

interface GenerationState {
  isLoading: boolean;
  names: GeneratedName[];
  currentStep: number;
  error?: string;
}

const GENERATION_STEPS = [
  "正在分析八字信息...",
  "正在查阅古籍典范...",
  "正在融合五行学说...",
  "正在计算音律美感...",
  "正在生成最优方案...",
  "正在进行最终优化...",
];

export default function GenerationResult() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<GenerationState>({
    isLoading: true,
    names: [],
    currentStep: 0,
  });
  const [displayedNames, setDisplayedNames] = useState<GeneratedName[]>([]);

  // 调用生成名字 API
  const generateNamesMutation = trpc.naming.generateNames.useMutation({
    onSuccess: (data: any) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        names: (data?.data?.names) || (data?.names) || [],
      }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "生成失败，请重试",
      }));
      toast.error("生成失败，请重试");
    },
  });

  // 初始化生成过程
  useEffect(() => {
    const formData = localStorage.getItem("generationFormData");
    if (!formData) {
      setLocation("/naming");
      return;
    }

    try {
      const data = JSON.parse(formData);
      // 调用 API 生成名字
      generateNamesMutation.mutate(data);
    } catch (error) {
      console.error("Failed to parse form data:", error);
      setLocation("/naming");
    }
  }, []);

  // 更新进度步骤，步步推进，在最后一步停下来
  useEffect(() => {
    if (state.isLoading && state.currentStep < GENERATION_STEPS.length - 1) {
      const stepTimer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1,
        }));
      }, 1500);

      return () => clearTimeout(stepTimer);
    }
  }, [state.isLoading, state.currentStep]);

  // 设置 1 分钟超时
  useEffect(() => {
    if (state.isLoading) {
      const timeoutTimer = setTimeout(() => {
        if (state.isLoading) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: "生成超时，请重试",
          }));
          toast.error("生成超时，请重试");
        }
      }, 60000);

      return () => clearTimeout(timeoutTimer);
    }
  }, [state.isLoading]);

  // 动画显示名字
  useEffect(() => {
    if (!state.isLoading && state.names.length > 0) {
      if (displayedNames.length < state.names.length) {
        const timer = setTimeout(() => {
          setDisplayedNames(prev => [...prev, state.names[displayedNames.length]]);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [state.isLoading, state.names, displayedNames.length]);

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success("已复制到剪贴板");
  };

  const handleViewDetail = (name: GeneratedName) => {
    localStorage.setItem("selectedName", JSON.stringify(name));
    setLocation("/name-detail");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-foreground">生成结果</h1>
          <Link href="/naming">
            <Button variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 md:py-12">
        {state.isLoading ? (
          // Loading state with steps
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              {/* Progress visualization */}
              <div className="space-y-4">
                {GENERATION_STEPS.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        index < state.currentStep
                          ? "bg-primary text-primary-foreground"
                          : index === state.currentStep
                          ? "bg-primary/30 text-primary animate-pulse"
                          : "bg-secondary/20 text-muted-foreground"
                      }`}
                    >
                      {index < state.currentStep ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          index <= state.currentStep
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                    {index === state.currentStep && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>
                ))}
              </div>

              {/* Current step message */}
              <div className="text-center pt-8">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {GENERATION_STEPS[state.currentStep]}
                </p>
                <p className="text-sm text-muted-foreground">
                  请稍候，AI 正在为您的宝宝精心设计名字...
                </p>
              </div>
            </div>
          </div>
        ) : state.error ? (
          // Error state
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-red-500 mb-4">{state.error}</p>
            <Link href="/naming">
              <Button>返回重新生成</Button>
            </Link>
          </div>
        ) : displayedNames.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground mb-4">暂无生成结果</p>
            <Link href="/naming">
              <Button>返回重新生成</Button>
            </Link>
          </div>
        ) : (
          // Results display
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  已为您生成 {displayedNames.length} 个名字
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  点击"详情"查看每个名字的详细分析和维度图表
                </p>
              </div>
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedNames.map((name, index) => (
                <div
                  key={name.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 md:p-6 h-full flex flex-col">
                      {/* Name header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-1 group-hover:text-primary/80 transition-colors">
                            {name.fullName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {name.pinyin}
                          </p>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-secondary ml-2">
                          {name.score}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-block px-2 md:px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {name.gender === "male"
                            ? "男"
                            : name.gender === "female"
                            ? "女"
                            : "中性"}
                        </span>
                        <span className="inline-block px-2 md:px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                          {name.fiveElements}
                        </span>
                      </div>

                      {/* Meaning */}
                      {name.meaning && (
                        <div className="mb-4 flex-1">
                          <p className="text-xs font-semibold text-foreground mb-1">
                            寓意
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                            {name.meaning}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                        <Button
                          size="sm"
                          onClick={() => handleCopyName(name.fullName)}
                          className="flex-1 rounded-lg text-xs md:text-sm"
                          variant="outline"
                        >
                          <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          复制
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg text-xs md:text-sm"
                          variant="outline"
                        >
                          <Heart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          收藏
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetail(name)}
                          className="flex-1 rounded-lg text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          详情
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 justify-center pt-8">
              <Link href="/naming">
                <Button variant="outline" className="rounded-lg">
                  返回编辑
                </Button>
              </Link>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                保存所有名字
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
