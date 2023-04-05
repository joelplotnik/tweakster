class Article < ApplicationRecord
    validates :title, presence: true, length: { minimum: 5, maximum: 100 }
    validates :author, presence: true, length: { minimum: 5, maximum: 200 }
    validates :content, presence: true, length: { minimum: 10, maximum: 2000 }
end
