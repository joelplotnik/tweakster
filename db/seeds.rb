unless User.exists?
  # Create Users
  10.times do
    User.create!(
      email: Faker::Internet.email,
      password: 'Password11!!',
      username: Faker::Internet.username
    )
  end

  # Create Channels
  users = User.all.to_a
  20.times do
    user = users.sample
    Channel.create!(
      name: Faker::Lorem.unique.characters(number: 20),
      url: Faker::Internet.url,
      protocol: Faker::Lorem.paragraph(sentence_count: 200),
      user_id: user.id
    )
  end

  # Assign Pieces to Users
  piece_count = 50
  # channels = Channel.all.to_a

  piece_count.times do
    user = users.sample
    channel = channels.sample
    Piece.create!(
      title: Faker::Book.title,
      content: Faker::Lorem.paragraph(sentence_count: 35),
      user_id: user.id,
      # channel_id: channel.id
    )
  end
end


# seeds.rb // PREVIOUS

# unless User.exists?
#     # Create Users
#     10.times do
#       User.create!(
#         email: Faker::Internet.email,
#         password: 'Password11!!',
#         username: Faker::Internet.username
#       )
#     end

#     # Assign Pieces to Users
#     users = User.all.to_a
#     piece_count = 50
  
#     piece_count.times do
#       user = users.sample
#       Piece.create!(
#         title: Faker::Book.title,
#         content: Faker::Lorem.paragraph(sentence_count: 35),
#         user_id: user.id
#       )
#     end
# end
  
  # # For a custom user
  # 10.times do
  #   user = User.first
  #   Prticle.create(
  #     title: Faker::Book.title,
  #     content: Faker::Lorem.paragraph(sentence_count: 20),
  #     user_id: user.id
  #   )
  # end