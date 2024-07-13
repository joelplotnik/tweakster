class HomeController < ApplicationController
  def show
    render :coming_soon, layout: false if should_render_coming_soon?
  end

  private

  def should_render_coming_soon?
    !(@allowed || Rails.env.development?)
  end
end
