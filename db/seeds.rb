# seeds.rb

unless User.exists?
    # Create Users
    10.times do
      User.create!(
        email: Faker::Internet.email,
        password: 'Password11!!',
        username: Faker::Internet.username
      )
    end

    # Assign Pieces to Users
    users = User.all.to_a
    piece_count = 50
  
    piece_count.times do
      user = users.sample
      Piece.create!(
        title: Faker::Book.title,
        content: Faker::Lorem.paragraph(sentence_count: 20),
        user_id: user.id
      )
    end
end
  
  # # For a custom user
  # 10.times do
  #   user = User.first
  #   Prticle.create(
  #     title: Faker::Book.title,
  #     content: Faker::Lorem.paragraph(sentence_count: 20),
  #     user_id: user.id
  #   )
  # end