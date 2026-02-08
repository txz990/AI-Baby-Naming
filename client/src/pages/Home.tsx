import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Sparkles, BookOpen, Heart, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">AI 宝宝取名</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-foreground hover:text-primary"
            >
              首页
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/naming")}
              className="text-foreground hover:text-primary"
            >
              开始取名
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/history")}
              className="text-foreground hover:text-primary"
            >
              历史记录
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            为宝宝取一个
            <span className="text-gradient block mt-2">富有文化内涵的名字</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            结合中国传统文化、五行学说、音律美感，由 AI 为您的宝宝精心打造独一无二的名字。每个名字都承载着深厚的文化底蕴和美好的寓意。
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/naming")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
          >
            立即开始取名 →
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card border-t border-border">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            为什么选择我们？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-center">文化底蕴</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  融合《诗经》《楚辞》《唐诗宋词》等经典古籍，每个名字都有出处和深层寓意。
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-lg text-center">五行八字</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  根据宝宝出生日期和时辰，结合易经五行学说，推荐最适合的名字。
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg text-center">音律美感</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  精心设计平仄搭配，确保名字朗朗上口，易于记忆和传播。
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-center">AI 智能推荐</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  采用先进的 AI 技术，结合传统文化知识，为您生成高质量的名字方案。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            使用步骤
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">填写信息</h4>
              <p className="text-muted-foreground">
                输入宝宝的基本信息、出生时辰、取名偏好等详细信息。
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">AI 生成</h4>
              <p className="text-muted-foreground">
                AI 根据您的需求，结合传统文化知识，生成多个高质量的名字方案。
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">收藏导出</h4>
              <p className="text-muted-foreground">
                收藏喜欢的名字，支持导出为 Excel、PDF 或文本格式。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-border">
        <div className="container text-center">
          <h3 className="text-3xl font-bold mb-6 text-foreground">
            准备好为宝宝取名了吗？
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            开启一段充满文化底蕴和美好寓意的取名之旅。
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/naming")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
          >
            现在就开始 →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 AI 宝宝取名。所有名字均由 AI 根据中国传统文化生成。</p>
          <p className="mt-2">
            每个名字都承载着深厚的文化内涵和美好的祝福。
          </p>
        </div>
      </footer>
    </div>
  );
}
