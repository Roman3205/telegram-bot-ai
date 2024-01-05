require('dotenv').config()

const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
let openAI = require('openai')

let openai = new openAI({
    apiKey: process.env.OPENAI_KEY
})

const bot = new Telegraf(process.env.TOKEN)

bot.start((ctx) => ctx.reply('Выберите команду:', {
    reply_markup: {
      keyboard: [
        ['/start', '/help'],
        ['/info', '/quit'],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
}))
bot.help((ctx) => ctx.reply('Чтобы задать вопрос нейросети, используйте /ask "вопрос"'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears(['Привет', 'привет'], (ctx) => ctx.reply('Привет, чем могу помочь?'))

bot.command('quit', async (ctx) => {
    try {
        let chatId = ctx.message.chat.id
        let userId = ctx.from.id

        if (ctx.message.chat.type === 'group' || ctx.message.chat.type === 'supergroup') {
            await ctx.telegram.kickChatMember(chatId, userId)
            await ctx.reply('Я покидаю этот чат.')
        } else {
            await ctx.reply('Извините, но я не могу покинуть личные чаты.')
        }
    } catch (error) {
        await ctx.reply('Произошла ошибка')
    }
  })

bot.command('ask', async(ctx) => {
    try {
      if(ctx.message.text.split(' ').length == 1) {
        return await ctx.reply('Команда должна быть с текстом')
      } 

      let prompt = ctx.message.text.split(' ').splice(1).join(' ')
      let response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
              { role: 'user', content: prompt },
          ]
      })
      
      await ctx.reply(response.choices[0].message.content)

    } catch (error) {
        await ctx.reply('Произошла ошибка')
    }
})

bot.command('info', async(ctx) => {
  try {
    let response = "Привет! Добро пожаловать в нашего телеграм-бота, оснащенного передовой нейросетевой технологией. Здесь вы можете не только общаться с искусственным интеллектом, но и получать уникальные и интеллектуальные ответы на ваши вопросы. Наш бот, базирующийся на передовой нейросети GPT-3.5 Turbo, спроектирован для того, чтобы предоставлять вам информацию, помощь и даже развлечения с использованием передовых алгоритмов глубокого обучения. Просто отправьте команду или вопрос, и наш бот постарается предоставить вам наилучший и контекстно подходящий ответ. Что делает нашего бота уникальным? Эта нейросеть обучена на огромном объеме данных, что позволяет ей понимать вас лучше и создавать более человекоподобные ответы. Будь то решение задач, поиск информации или даже просто разговор на интересные темы, наш телеграм-бот готов к взаимодействию с вами. Почувствуйте мощь искусственного интеллекта, общаясь с нашим телеграм-ботом."
  
    await ctx.reply(response)
    
  } catch (error) {
      await ctx.reply('Произошла ошибка')
  }
})

bot.on('text', (ctx) => {
    ctx.reply('Извините, не понимаю ваш запрос. Пожалуйста, воспользуйтесь известными командами.')
})

bot.launch()