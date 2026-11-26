<?php

namespace App\Filament\Resources\ProjectResource\RelationManagers;

use Filament\Forms;
use Filament\Tables;
use Filament\Resources\RelationManagers\RelationManager;
use App\Filament\Forms\Components\SecureImageUpload;
use Filament\Tables\Columns\ImageColumn;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';
    protected static ?string $title = 'Imagens';

    public function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            SecureImageUpload::make('image_path')
                ->label('Imagem')
                ->imagePreviewHeight('200')
                ->required(),
        ]);
    }

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                ImageColumn::make('image_path')->label('Imagem'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }
}
