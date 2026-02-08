import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { saveNames, getNamesByUserId, getGenerationHistory, saveGenerationHistory, updateNameCollection, deleteName, getCollectedNames } from "./db";
import { nanoid } from "nanoid";

// Generation parameters schema
const GenerationParamsSchema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  surname: z.string().min(1, "姓氏不能为空"),
  follow: z.enum(["father", "mother"]).default("father"),
  birthday: z.string().optional(),
  birthTime: z.string().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  preference: z.string().optional(),
  meaning: z.string().optional(),
  style: z.string().optional(),
  fiveElements: z.string().optional(),
  custom: z.string().optional(),
  avoidChars: z.string().optional(),
  soundPreference: z.string().optional(),
  zodiac: z.string().optional(),
  cultureSource: z.string().optional(),
  radical: z.string().optional(),
  constellation: z.string().optional(),
  international: z.boolean().default(false),
  nameLength: z.number().int().min(1).max(2).default(2),
  count: z.number().int().min(10).max(20).default(10),
  history: z.array(z.string()).default([]),
});

type GenerationParams = z.infer<typeof GenerationParamsSchema>;

/**
 * Build AI prompt for name generation
 */
function buildNameGenerationPrompt(params: GenerationParams, history: string[] = []): string {
  const systemPrompt = `# Role
你是一位精通中国传统文化（诗经、楚辞、唐诗宋词）、易经五行学说、现代姓名美学及音律学、生肖星座文化的"首席起名大师"。

# Task
请根据用户提供的家庭背景和偏好，为宝宝提供具有深度文化内涵、好听顺口且意蕴深远的名字方案。每次生成数量为${params.count}个。生成结果需与历史结果去重，避免重复。

# Input Parameters
{
  "father_name": "${params.fatherName || ''}",
  "mother_name": "${params.motherName || ''}",
  "surname": "${params.surname}",
  "follow": "${params.follow}",
  "birthday": "${params.birthday || ''}",
  "birth_time": "${params.birthTime || ''}",
  "gender": "${params.gender || 'unknown'}",
  "preference": "${params.preference || ''}",
  "meaning": "${params.meaning || ''}",
  "style": "${params.style || ''}",
  "five_elements": "${params.fiveElements || ''}",
  "custom": "${params.custom || ''}",
  "avoid_chars": "${params.avoidChars || ''}",
  "sound_preference": "${params.soundPreference || ''}",
  "zodiac": "${params.zodiac || ''}",
  "culture_source": "${params.cultureSource || ''}",
  "radical": "${params.radical || ''}",
  "constellation": "${params.constellation || ''}",
  "international": ${params.international},
  "name_length": ${params.nameLength},
  "count": ${params.count},
  "history": [${history.map(n => `"${n}"`).join(", ")}]
}

# Rules & Constraints
1. **文化底蕴**：优先从经典古籍中取词，并说明出处。如果指定了culture_source，必须从指定的文化来源取词。
2. **避免俗气**：避开过度重复的网红字（如：梓、轩、涵、睿），也必须避开用户指定的avoid_chars中的字。
3. **音律美感**：考虑姓氏与名字的平仄搭配，确保朗朗上口。根据sound_preference调整。
4. **生肖匹配**：如果指定了zodiac，需考虑生肖喜用字和忌用字。
5. **星座匹配**：如果指定了constellation，需考虑星座特质推荐合适字。
6. **偏旁要求**：如果指定了radical，至少有一个字需包含该偏旁。
7. **国际化**：如果international为true，推荐易于翻译或有美好英文谐音的字。
8. **结构化输出**：必须严格按照 JSON 格式返回结果，以便程序解析。
9. **性别匹配**：若性别明确，则按数量生成；若性别未知，则男宝女宝名字各占一半。
10. **去重**：生成的名字不得与history中的名字重复。
11. **错误处理**：如生成失败，需返回错误信息。

# Output Format (JSON)
必须返回严格的JSON格式，不要包含任何其他文字说明：
{
  "names": [
    {
      "full_name": "姓名",
      "pinyin": "拼音",
      "gender": "男/女/中性",
      "source": "出处（如《诗经·小雅》）",
      "meaning": "深度寓意解析",
      "five_elements": "五行分析",
      "sound_analysis": "音韵分析（声调搭配）",
      "score": 95
    }
  ]
}`;

  return systemPrompt;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Baby naming features
  naming: router({
    /**
     * Generate baby names using AI
     */
    generateNames: publicProcedure
      .input(GenerationParamsSchema)
      .mutation(async ({ input }) => {
        try {
          // Validate surname
          if (!input.surname || input.surname.trim().length === 0) {
            return {
              code: 1002,
              message: "姓氏不能为空",
              data: null,
            };
          }

          // Validate count
          if (input.count !== 10 && input.count !== 20) {
            return {
              code: 1003,
              message: "生成数量必须为10或20",
              data: null,
            };
          }

          // Build prompt
          const prompt = buildNameGenerationPrompt(input, input.history);

          // Call LLM
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: prompt,
              },
              {
                role: "user",
                content: `请为我的宝宝生成${input.count}个名字。宝宝姓氏是"${input.surname}"。${input.gender === "male" ? "宝宝是男孩。" : input.gender === "female" ? "宝宝是女孩。" : ""}${input.meaning ? `期望寓意：${input.meaning}。` : ""}${input.style ? `风格：${input.style}。` : ""}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "baby_names",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    names: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          full_name: { type: "string" },
                          pinyin: { type: "string" },
                          gender: { type: "string" },
                          source: { type: "string" },
                          meaning: { type: "string" },
                          five_elements: { type: "string" },
                          sound_analysis: { type: "string" },
                          score: { type: "number" },
                        },
                        required: ["full_name", "pinyin", "gender", "source", "meaning", "five_elements", "sound_analysis", "score"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["names"],
                  additionalProperties: false,
                },
              },
            },
          });

          // Parse response
          const content = response.choices[0]?.message.content;
          if (!content) {
            return {
              code: 2003,
              message: "返回格式解析失败",
              data: null,
            };
          }

          let parsedNames;
          try {
            const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
            parsedNames = JSON.parse(contentStr);
          } catch (parseError) {
            console.error("[Naming] JSON parse error:", parseError);
            return {
              code: 2003,
              message: "返回格式解析失败",
              data: null,
            };
          }

          if (!parsedNames.names || !Array.isArray(parsedNames.names)) {
            return {
              code: 2003,
              message: "返回格式解析失败",
              data: null,
            };
          }

          // Transform to database format
          const names = parsedNames.names.map((name: any) => ({
            id: nanoid(36),
            userId: 0, // Anonymous user
            fullName: name.full_name,
            pinyin: name.pinyin,
            gender: name.gender === "男" ? "male" : name.gender === "女" ? "female" : "neutral",
            source: name.source,
            meaning: name.meaning,
            fiveElements: name.five_elements,
            soundAnalysis: name.sound_analysis,
            score: name.score,
            collected: false,
            generationParams: input,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          return {
            code: 0,
            message: "success",
            data: {
              names,
            },
          };
        } catch (error) {
          console.error("[Naming] Generation error:", error);
          return {
            code: 2001,
            message: "AI服务调用失败",
            data: null,
          };
        }
      }),

    /**
     * Get user's generated names (requires authentication)
     */
    getNames: protectedProcedure.query(async ({ ctx }) => {
      try {
        const names = await getNamesByUserId(ctx.user.id);
        return {
          code: 0,
          message: "success",
          data: { names },
        };
      } catch (error) {
        console.error("[Naming] Get names error:", error);
        return {
          code: 9999,
          message: "获取名字列表失败",
          data: null,
        };
      }
    }),

    /**
     * Get collected names (requires authentication)
     */
    getCollectedNames: protectedProcedure.query(async ({ ctx }) => {
      try {
        const names = await getCollectedNames(ctx.user.id);
        return {
          code: 0,
          message: "success",
          data: { names },
        };
      } catch (error) {
        console.error("[Naming] Get collected names error:", error);
        return {
          code: 9999,
          message: "获取收藏名字失败",
          data: null,
        };
      }
    }),

    /**
     * Collect/uncollect a name (requires authentication)
     */
    collectName: protectedProcedure
      .input(z.object({
        nameId: z.string(),
        collected: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await updateNameCollection(input.nameId, input.collected);
          return {
            code: 0,
            message: "success",
            data: null,
          };
        } catch (error) {
          console.error("[Naming] Collect name error:", error);
          return {
            code: 9999,
            message: "操作失败",
            data: null,
          };
        }
      }),

    /**
     * Delete a name (requires authentication)
     */
    deleteName: protectedProcedure
      .input(z.object({
        nameId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await deleteName(input.nameId);
          return {
            code: 0,
            message: "success",
            data: null,
          };
        } catch (error) {
          console.error("[Naming] Delete name error:", error);
          return {
            code: 9999,
            message: "删除失败",
            data: null,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
