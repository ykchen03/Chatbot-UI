import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { DatabaseService } from '@/app/lib/database'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, model = 'nvidia/llama-3.1-nemotron-ultra-253b-v1' } = await request.json()

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await DatabaseService.getConversation(conversationId, user.id)
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      // Create new conversation with first message as title
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message
      conversation = await DatabaseService.createConversation(user.id, title)
    }

    // Save user message
    const userMessage = await DatabaseService.addMessage({
      conversation_id: conversation.id,
      role: 'user',
      content: message,
      model
    })

    // Get conversation history
    const messages = await DatabaseService.getMessages(conversation.id)
    
    // Prepare messages for OpenAI
    const openaiMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    // Get AI response
    const completion = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Save assistant message
    const assistantMessage = await DatabaseService.addMessage({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse,
      token_count: completion.usage?.total_tokens,
      model
    })

    // Update conversation timestamp
    await DatabaseService.updateConversation(conversation.id, user.id, {})

    return NextResponse.json({
      conversation,
      userMessage,
      assistantMessage,
      usage: completion.usage
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}