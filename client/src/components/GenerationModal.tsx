import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Heart, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

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

interface GenerationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  loadingMessage: string;
  generatedNames: GeneratedName[];
  onClose: () => void;
  onViewDetail: (name: GeneratedName) => void;
}

export default function GenerationModal({
  isOpen,
  isLoading,
  loadingMessage,
  generatedNames,
  onClose,
  onViewDetail,
}: GenerationModalProps) {
  const [displayedNames, setDisplayedNames] = useState<GeneratedName[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 动画显示生成的名字
  useEffect(() => {
    if (!isLoading && generatedNames.length > 0) {
      if (currentIndex < generatedNames.length) {
        const timer = setTimeout(() => {
          setDisplayedNames(prev => [...prev, generatedNames[currentIndex]]);
          setCurrentIndex(prev => prev + 1);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, generatedNames, currentIndex]);

  // 重置显示的名字
  useEffect(() => {
    if (isOpen && !isLoading) {
      setDisplayedNames([]);
      setCurrentIndex(0);
    }
  }, [isOpen, isLoading]);

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success("已复制到剪贴板");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background to-secondary/5 border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">AI 生成结果</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="relative w-32 h-32">
                {/* Animated circles */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-secondary border-l-secondary animate-spin" style={{ animationDirection: "reverse" }}></div>
                <div className="absolute inset-8 rounded-full border-2 border-primary/30 animate-pulse"></div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-foreground">{loadingMessage}</p>
                <p className="text-sm text-muted-foreground">正在调用 AI 模型生成名字...</p>
              </div>

              {/* Progress indicators */}
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          ) : displayedNames.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground">暂无生成结果</p>
            </div>
          ) : (
            // Results grid
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  已生成 {displayedNames.length} 个名字
                  {generatedNames.length > displayedNames.length && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (共 {generatedNames.length} 个)
                    </span>
                  )}
                </h3>
              </div>

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
                            <h4 className="text-3xl md:text-4xl font-bold text-primary mb-1 group-hover:text-primary/80 transition-colors">
                              {name.fullName}
                            </h4>
                            <p className="text-xs md:text-sm text-muted-foreground">{name.pinyin}</p>
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-secondary ml-2">
                            {name.score}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-block px-2 md:px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {name.gender === "male" ? "男" : name.gender === "female" ? "女" : "中性"}
                          </span>
                          <span className="inline-block px-2 md:px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                            {name.fiveElements}
                          </span>
                        </div>

                        {/* Meaning */}
                        {name.meaning && (
                          <div className="mb-4 flex-1">
                            <p className="text-xs font-semibold text-foreground mb-1">寓意</p>
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
                          <Link href="/name-detail" onClick={() => onViewDetail(name)}>
                            <Button
                              size="sm"
                              className="flex-1 rounded-lg text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              详情
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Loading indicator for remaining names */}
              {isLoading && generatedNames.length > displayedNames.length && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">加载更多名字...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && displayedNames.length > 0 && (
          <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-lg">
              关闭
            </Button>
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              返回编辑
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
