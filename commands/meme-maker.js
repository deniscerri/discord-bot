
const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const index = require('../index.js');
const jimp = require('jimp');


module.exports = {
    data: new SlashCommandBuilder()
	.setName('meme-maker')
	.setDescription('Create a meme!')
    .addAttachmentOption(option => option.setName('image').setDescription('Upload the meme image').setRequired(true))
    .addStringOption(option => option.setName('top-text').setDescription('Write the top text').setRequired(false))
    .addStringOption(option => option.setName('bottom-text').setDescription('Write the bottom text').setRequired(false)),
	async execute(message) {
        await message.deferReply();

        let image = await message.options.getAttachment('image')
        let string1 = await message.options.getString('top-text') || ""
        let string2 = await message.options.getString('bottom-text') || ""
        
        image = await jimp.read(image.url)
        let width = image.bitmap.width
        let font;
        if(width <= 300){
            font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE)
        }else if(width <= 800){
            font = await jimp.loadFont(jimp.FONT_SANS_64_WHITE)
        }else{
            font = await jimp.loadFont(jimp.FONT_SANS_128_WHITE)
        }
        image.print(font, 10, 10, {
            text: string1,
            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: jimp.VERTICAL_ALIGN_TOP
          }, image.bitmap.width, image.bitmap.height - 10);
          image.print(font, 10, 10, {
            text: string2,
            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
          }, image.bitmap.width, image.bitmap.height - 10);
        const buffer = await image.getBufferAsync(jimp.MIME_PNG);
        const attachment = new AttachmentBuilder(buffer)
        message.editReply({files: [attachment] })
  },
};
